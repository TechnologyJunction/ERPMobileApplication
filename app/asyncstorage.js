import AsyncStorage from '@react-native-community/async-storage';

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        console.warn('error while saving: ', e)
    }
}

export const getDataValue = async (key) => {
    let value = null
    try {
        await AsyncStorage.getItem(key).then((result) => {
            value = result
        })
    } catch (e) {
        console.warn('error while retrieving: ', e)
    }
    return value;
}

export const getDataPromise = async (key) => {
    let value = null
    try {
        value = await AsyncStorage.getItem(key)
        return value
    } catch (e) {
        console.warn('error while retrieving: ', e)
    }
    return value;
}
