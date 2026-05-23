import { getPayload } from 'payload';
import config from '../src/payload.config';

const run = async () => {
  try {
    const payload = await getPayload({ config });
    console.log('Payload initialized locally.');
    const idsToDelete = [4, 5, 11, 12, 13, 16, 17];
    for (const id of idsToDelete) {
      try {
        await payload.delete({
          collection: 'products',
          id: id,
        });
        console.log(`Successfully deleted product ID ${id}`);
      } catch (e: any) {
        console.log(`Failed to delete product ID ${id}:`, e.message);
      }
    }
    console.log('Finished deletion process.');
    process.exit(0);
  } catch (error) {
    console.error('Error during deletion:', error);
    process.exit(1);
  }
};

run();
