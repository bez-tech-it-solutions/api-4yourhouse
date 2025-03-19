import axios from 'axios';
import env from '../../common/constants/env.constants.js';

const getProperties = async (feedType, url) => {
    const tokens = {
        IDX: env.TOKEN_IDX,
        DLA: env.TOKEN_DLA,
        VOW: env.TOKEN_VOW
    };

    if (!tokens[feedType]) {
        throw new Error(`Invalid feed type: ${feedType}`);
    }

    try {
        const response = await axios.get(`${env.API_URL}${url}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokens[feedType]}`
            },
            timeout: 30000 // 30 seconds timeout
        });

        return response.data;
    } catch (error) {
        // if (error.response) {
        //     throw new Error(`API Error: HTTP ${error.response.status}`);
        // } else if (error.request) {
        //     throw new Error("Request failed, no response received");
        // } else {
        //     throw new Error(`Axios Error: ${error.message}`);
        // }
        console.log(error);
    }
};

export default getProperties;