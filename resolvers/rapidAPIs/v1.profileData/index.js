import axios from "axios";
import constants from "../../../constants.js";
import {setCache, getCache} from '../../../services/redisClient.js'
import moment from "moment";

function validateRequestParams(request){
    const userName = request.user_name;
    const responseType = request.response_type;

    if(!userName || !responseType)
     return false; // if params are missing or can specify as well which params
    
    return (typeof userName == "string" && typeof responseType == "string") ? true : false;
       
}

async function getProfileDataApiResponse(userName, responseType) {
    const options = {
        method: 'GET',
        url: constants.RAPID_API_PROFIL_URL,
        params: {ig: userName, response_type: responseType, corsEnabled: 'false'},
        headers: {
          'x-rapidapi-host': constants.RAPID_API_HOST,
          'x-rapidapi-key': constants.RAPID_API_SECRET_KEY
        }
      };
    
    const response  = axios.request(options)
    .then(x=>x.data)
    . catch((error) =>console.error(error));
    return response;
}

function validateRapidAPIResponse(response){
    let error = {};
    if(!response.status)
    return response;
    else {//if(!(response.status>=200&&response.status<300)) {
        error.status=response.status;
        error.message=response.statusText;
        return error;
    }
}

function getCacheKeyForCurrentMinute() {
    const currentMinute = moment().minute();

    // to convert minute into two digit form
    if(currentMinute<=9) currentMinute = `0${currentMinute}`;
    const nextMinute =Number(currentMinute)+1;
    if(nextMinute<=9) nextMinute = `0${nextMinute}`;

    const key = `profile-data-limit-${currentMinute}-${nextMinute}`;
    return key;
}

async function checkCurrentStatus(){
    const cacheKeyForTheMinute = getCacheKeyForCurrentMinute();
    const requestCount= Number(await getCache(cacheKeyForTheMinute));
    if(requestCount<10){
        return true;
    }
    return false;
}

async function delayResponse(userName, responseType) {
 const canWeExecuteRequest =  await Promise.resolve(setTimeout(checkCurrentStatus,60));
 let response;
 if(canWeExecuteRequest){
    let profilAPIresponse= await getProfileDataApiResponse(userName, responseType);
    response = validateRapidAPIResponse(profilAPIresponse);
    if(!response.status){
        const cacheKeyForTheMinute = getCacheKeyForCurrentMinute();    
        await setCache(cacheKeyForTheMinute,requestCount+1,60); //increase request count
    }
 }
 else{
    response.statusText = 'Too Many Requessts,try later';
    response.status=429;
 } 
 return response;
}

export default async (req,res,next) => {
    console.log(req.query);

    const isValidRequest = validateRequestParams(req.query);
    if(!isValidRequest)
    res.status(400).send({
        message: 'Bad Request'
     });

    if(isValidRequest){
        const userName = req.query.user_name;
        const responseType = req.query.response_type;
        
        const cacheKeyForTheMinute = getCacheKeyForCurrentMinute();
        const requestCount= Number(await getCache(cacheKeyForTheMinute));
        console.log(requestCount);
        await setCache(cacheKeyForTheMinute,requestCount+1,60);

        if(requestCount<10){
        const profileAPIResponse = await getProfileDataApiResponse(userName, responseType);
        const response = validateRapidAPIResponse(profileAPIResponse);
        
        console.log("rapid res: "+profileAPIResponse);   
        console.log("response after validation :"+response);
        if(!response.status)
            res.status(200).send(response);
        else
            res.status(response.status).send(response.statusText);
        }
        else if(requestCount>=10 && requestCount<20){
            // delaying response
          const delayedResponse=  await delayResponse(userName,responseType);
          if(delayedResponse.status>=200 && delayResponse.status<300)
              res.status(200).send(delayedResponse)
         else
              res.status(response.status).send(response.statusText);
        }
        else {
            res.status(429).send({
                message: 'Too Many Requessts,try later'
             });    
        }
        // ideally send profileAPIResponse to transformer to extract meaningful info and then return
    }
}