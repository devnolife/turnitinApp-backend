const {
    handleServerResponse
} = require('../utils/utils')

const roleValidations = (roleUser, callback) => {
    return async (req, res, next) => {
        const { role } = req.user;
        if (role !== roleUser) {
            handleServerResponse(res, 401, "Unauthorized Access", "You are not authorized to access this resource."
            );
        } else {
            try {
                await callback(req, res, next);
            } catch (err) {
                next(err);
            }
        }
    };
};


module.exports = {
    roleValidations
}