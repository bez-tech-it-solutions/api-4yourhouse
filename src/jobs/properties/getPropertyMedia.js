import getProperties from './getProperties.js';

const propertiesMediaJob = async (listingKey, top = 10) => {
    if (!listingKey) {
        throw new Error("Listing key is required.");
    }

    // const url = `/Media?$top=${top}&$orderby=Order&$filter=MediaCategory eq 'Photo' and ImageSizeDescription eq 'Largest' and ResourceRecordKey eq '${listingKey}'`;
    const url = `/Media?$top=10000&$orderby=Order&$filter=Order lt 2 and MediaStatus eq 'Active' and MediaCategory eq 'Photo' and ResourceName eq 'Property' and ResourceRecordKey eq '${listingKey}' and ImageSizeDescription eq 'Largest'`;
    const data = await getProperties("IDX", url);

    return data?.value?.length > 0 ? data.value.map(media => media.MediaURL) : [];
};

export default propertiesMediaJob;