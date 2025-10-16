import { promises as fs } from 'node:fs';
import { type NextRequest, NextResponse } from 'next/server';
import path from 'node:path';

export async function GET(_request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');

    // Read all files in the data directory
    const files = await fs.readdir(dataDir);

    // Filter for GeoJSON files
    const geoJsonFiles = files.filter((file) => file.endsWith('.geojson'));

    // Read each GeoJSON file and determine its type
    const transitData = await Promise.all(
      geoJsonFiles.map(async (file) => {
        const filePath = path.join(dataDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const geoJson = JSON.parse(fileContent);

        // Determine if it's stations (points) or lines (linestrings)
        const firstFeature = geoJson.features?.[0];
        const geometryType = firstFeature?.geometry?.type;

        const isStations = geometryType === 'Point';
        const isLines = geometryType === 'LineString' || geometryType === 'MultiLineString';

        return {
          filename: file,
          url: `/data/${file}`,
          type: isStations ? 'stations' : isLines ? 'lines' : 'unknown',
          featureCount: geoJson.features?.length || 0,
        };
      })
    );

    return NextResponse.json({ files: transitData }, { status: 200 });
  } catch (error) {
    console.error('Error reading transit data:', error);
    return NextResponse.json({ error: 'Failed to read transit data' }, { status: 500 });
  }
}
