import profileDataValidator from '../resolvers/rapidAPIs/v1.profileData/validator.js';
import profileData from '../resolvers/rapidAPIs/v1.profileData/index.js';

export default (router) => {
    router.route('/profile-data').get(
        //profileDataValidator,
        profileData);
}