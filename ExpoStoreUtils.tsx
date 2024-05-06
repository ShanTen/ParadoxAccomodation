import * as SecureStore from 'expo-secure-store';

async function save(key : string, value : any) {
    await SecureStore.setItemAsync(key, value);
}
  
async function getValueFor(key : string) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
      return result;
    } else {
      //throw error
      let error = new Error('No values stored under that key.');
      error.name = 'NoValueError';
        throw error;
    }
}

async function removeKey(key : string) {
    await SecureStore.deleteItemAsync(key);
}

export { save, getValueFor };