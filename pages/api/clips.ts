import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

// Initialize Mux with the correct configuration structure
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!
});

interface MuxAsset {
  id: string;
  playback_ids?: Array<{
    id: string;
    policy: string;
  }>;
}

async function findAssetByPlaybackId(playbackId: string) {
  try {
    // List all assets and find the one with matching playback ID
    const { data } = await mux.video.assets.list();
    const asset = data.find((a: MuxAsset) => 
      a.playback_ids?.some((p) => p.id === playbackId)
    );
    
    if (!asset) {
      throw new Error('Asset not found for playback ID');
    }

    return asset.id;
  } catch (error) {
    console.error('Error finding asset:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data } = await mux.video.assets.list({
        limit: 12 // Get 12 most recent assets
      });

      // Filter and transform the data
      const clips = data
        .filter(asset => 
          // Only include assets that are ready and have valid playback IDs
          asset.status === 'ready' && 
          asset.playback_ids && 
          asset.playback_ids.length > 0
        )
        .map((asset, index) => ({
          id: asset.id,
          title: `DegenSwim Stream ${index + 1}`, // Use sequential numbering
          playbackId: asset.playback_ids![0].id,
          thumbnailUrl: `https://image.mux.com/${asset.playback_ids![0].id}/thumbnail.webp?time=5&width=240&height=135`
        }));

      return res.status(200).json(clips);
    } catch (error) {
      console.error('Error fetching clips:', error);
      return res.status(500).json({ message: 'Error fetching clips' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { playbackId, startTime, endTime } = req.body;
    console.log('Received clip request:', { playbackId, startTime, endTime });

    if (!playbackId || startTime === null || endTime === null) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the asset ID by listing all assets
    const assetId = await findAssetByPlaybackId(playbackId);
    console.log('Found asset ID:', assetId);

    console.log('Creating clip with Mux...');
    const asset = await mux.video.assets.create({
      input: [{
        url: `mux://assets/${assetId}`,
        start_time: startTime,
        end_time: endTime
      }],
      playback_policy: ['public']
    });
    console.log('Mux response:', asset);

    return res.status(200).json(asset);
  } catch (error: any) {
    console.error('Error creating clip:', error);
    return res.status(500).json({ 
      message: 'Error creating clip',
      error: error.message,
      details: error.response?.body || error.toString()
    });
  }
} 