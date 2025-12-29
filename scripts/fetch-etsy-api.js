#!/usr/bin/env node

/**
 * Fetch Etsy shop listings using Etsy API v3
 * Requires ETSY_API_KEY environment variable
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ETSY_API_KEY = process.env.ETSY_API_KEY;
const SHOP_NAME = 'HeartfeltDesigns1';
const API_BASE = 'https://openapi.etsy.com/v3/application';

if (!ETSY_API_KEY) {
    console.error('❌ Error: ETSY_API_KEY environment variable is required');
    console.error('Usage: ETSY_API_KEY=your_key_here node scripts/fetch-etsy-api.js');
    process.exit(1);
}

/**
 * Make a request to the Etsy API
 */
async function etsyRequest(endpoint) {
    const url = `${API_BASE}${endpoint}`;
    console.log(`📡 Fetching: ${url}`);

    const response = await fetch(url, {
        headers: {
            'x-api-key': ETSY_API_KEY
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Etsy API error (${response.status}): ${errorText}`);
    }

    return response.json();
}

/**
 * Get shop ID from shop name
 */
async function getShopId(shopName) {
    console.log(`🔍 Looking up shop ID for: ${shopName}`);
    const data = await etsyRequest(`/shops?shop_name=${shopName}`);

    if (!data.results || data.results.length === 0) {
        throw new Error(`Shop not found: ${shopName}`);
    }

    const shopId = data.results[0].shop_id;
    console.log(`✅ Found shop ID: ${shopId}`);
    return shopId;
}

/**
 * Get all active listings for a shop (handles pagination)
 */
async function getAllListings(shopId) {
    console.log(`📦 Fetching active listings for shop ${shopId}...`);

    let allListings = [];
    let offset = 0;
    const limit = 100; // Max allowed by API

    while (true) {
        const data = await etsyRequest(
            `/shops/${shopId}/listings/active?limit=${limit}&offset=${offset}&includes=Images`
        );

        if (!data.results || data.results.length === 0) {
            break;
        }

        allListings = allListings.concat(data.results);
        console.log(`  ✓ Fetched ${data.results.length} listings (total: ${allListings.length})`);

        // Check if there are more results
        if (data.results.length < limit) {
            break;
        }

        offset += limit;
    }

    console.log(`✅ Total listings fetched: ${allListings.length}`);
    return allListings;
}

/**
 * Transform Etsy listing data to our pattern format
 */
function transformListings(listings) {
    return listings.map(listing => {
        // Get the first image URL (highest quality available)
        let imgUrl = '';
        if (listing.images && listing.images.length > 0) {
            // Use url_fullxfull for best quality, fallback to url_570xN
            imgUrl = listing.images[0].url_fullxfull || listing.images[0].url_570xN || '';
        }

        // Format price
        const price = listing.price ? `CA$${listing.price.amount / listing.price.divisor}` : '';

        return {
            title: listing.title,
            price: price,
            imgUrl: imgUrl,
            url: listing.url
        };
    }).filter(pattern => pattern.imgUrl); // Only include items with images
}

/**
 * Save patterns to JSON file
 */
function savePatterns(patterns) {
    const outputPath = path.join(__dirname, '../src/data/patterns.json');
    const outputDir = path.dirname(outputPath);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(patterns, null, 4));
    console.log(`✅ Saved ${patterns.length} patterns to ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚀 Starting Etsy API fetch...\n');

        // Get shop ID
        const shopId = await getShopId(SHOP_NAME);

        // Fetch all listings
        const listings = await getAllListings(shopId);

        // Transform to our format
        const patterns = transformListings(listings);

        // Save to file
        savePatterns(patterns);

        console.log('\n✨ Success! Patterns updated.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

main();
