export const handleValidation = (error, modelName) => {
    if (error.message.includes(`${modelName} validation failed`)) {
        const errors = {};
        Object.values(error?.errors).map(({properties}) => errors[properties?.path] = properties?.message);
        return errors;
    }

    if (error.code === 11000) {
        const errors = {};
        Object.keys(error?.keyValue).map(elem => errors[elem] = `This ${elem} already exists`);
        return errors;
    }

    return { error: `Process Failed \n ${error}` }
}