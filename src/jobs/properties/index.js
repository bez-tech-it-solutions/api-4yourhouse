import cron from 'node-cron';
import getProperties from './getProperties.js';
import getPropertyMedia from './getPropertyMedia.js';
import Properties from '../../models/property.model.js';


const propertiesJob = async () => {
    cron.schedule('* * * * *', async () => {
        try {
            const lastProperty = await Properties.findOne({ modified: 1 }).sort({ modified: -1 });
            const lastModifiedDate = lastProperty ? new Date(lastProperty.modified).toISOString() : new Date().toISOString();

            // const url = `/Property?$top=1000&$filter=ModificationTimestamp gt ${lastModifiedDate}&$orderby=ModificationTimestamp`;
            const url = `/Property?$top=1000&$orderby=ModificationTimestamp`;
            const propData = await getProperties('IDX', url);

            if (!propData || !propData.value) {
                console.log("No new properties found.");
                return;
            }

            for (const listing of propData.value) {
                try {
                    const media = await getPropertyMedia(listing.ListingKey);
                    const exists = await Properties.findOne({ listingKey: listing.ListingKey });

                    if (!exists) {
                        await Properties.create({
                            listingKey: listing.ListingKey,
                            json: {
                                ...listing,
                                media,
                                modified: listing.ModificationTimestamp
                            }
                        });

                        console.log("Cron job completed successfully.");
                    }
                } catch (error) {
                    console.log(`Error processing listing ${listing.ListingKey}: ${error.message}`);
                }
            }
        } catch (error) {
            console.log(`Cron job error: ${error.message}`);
        }
    });
};

export default propertiesJob;