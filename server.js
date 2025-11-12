#!/usr/bin/env node

/**
 * Simple static file server for the Productivity Dashboard
 * Runs the built React app on localhost:1122
 * Also handles calendar API endpoints and hourly calendar fetching
 */

import http from 'http';
import { readFileSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  storeToken,
  getToken,
  refreshCalendarEvents,
  getStoredEvents,
  getLastFetchTime,
} from './server/calendarService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 1122;
const BUILD_DIR = join(__dirname, 'dist');
const DATA_DIR = join(__dirname, 'data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // API Routes
  if (pathname === '/api/calendar/events') {
    // Get calendar events
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    const events = getStoredEvents();
    const lastFetch = getLastFetchTime();
    res.end(JSON.stringify({ events, lastFetch }));
    return;
  }

  if (pathname === '/api/calendar/token' && req.method === 'POST') {
    // Store OAuth token
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { token } = JSON.parse(body);
        if (token) {
          storeToken(token);
          // Immediately fetch calendar events
          refreshCalendarEvents().then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: true, message: 'Token stored and calendar refreshed' }));
          });
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: false, error: 'No token provided' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  if (pathname === '/api/calendar/refresh' && req.method === 'POST') {
    // Manually refresh calendar
    refreshCalendarEvents().then((success) => {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success, message: success ? 'Calendar refreshed' : 'Failed to refresh calendar' }));
    });
    return;
  }

  // Static file serving
  let filePath = join(BUILD_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    // For SPA routing, serve index.html for all non-file requests
    if (!extname(filePath)) {
      filePath = join(BUILD_DIR, 'index.html');
    } else {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
  }

  try {
    const fileContent = readFileSync(filePath);
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fileContent);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// Set up hourly calendar refresh
let refreshInterval = null;

const startHourlyRefresh = () => {
  // Refresh immediately on startup if token exists
  const token = getToken();
  if (token) {
    console.log('🔄 Initial calendar fetch on startup...');
    refreshCalendarEvents();
  }

  // Then refresh every hour
  refreshInterval = setInterval(() => {
    console.log('🔄 Hourly calendar refresh...');
    refreshCalendarEvents();
  }, 60 * 60 * 1000); // 1 hour

  console.log('⏰ Hourly calendar refresh enabled');
};

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Productivity Dashboard running at http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${BUILD_DIR}`);
  console.log(`🔄 Press Ctrl+C to stop`);
  
  // Start hourly calendar refresh
  startHourlyRefresh();
});

// Graceful shutdown
const shutdown = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  shutdown();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  shutdown();
});

