import pkg from 'redis';

const { createClient } = pkg;

export async function setCache (key,value,ttl=0){
  const client = createClient();

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  await client.set(key, value,'EX',ttl);
  // ideally ttl to be kept in config with other cache key timings
};

export async function getCache(key){
    const client = createClient();
  
    client.on('error', (err) => console.log('Redis Client Error', err));
  
    await client.connect();
  
    const response = await client.get(key);
    return response;
  };

