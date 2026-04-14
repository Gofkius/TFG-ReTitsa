import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react';



export interface AppContextType{
    preferences: string;
    firstLoad?: boolean;
    firstLoadReady?: boolean;
    setPreferences: Dispatch<SetStateAction<string>>;
    setFirstLoad: Dispatch<SetStateAction<boolean>>;
    setFirstLoadReady: Dispatch<SetStateAction<boolean>>;
}

const storeData = async (value: any, jsonName: string) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(jsonName, jsonValue)
    } catch (e) {
       console.log('Error storing data', e);
    }
}

const getState = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('firstLoadState')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
        console.log('Error getting first load state', e);
    }
}

const getPreferences = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('preferences')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
        console.log('Error getting preferences', e);
    }
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const InitContextProvider = (props: any) => {

    const [preferences, setPreferences] = useState<string>("");
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [firstLoadReady, setFirstLoadReady] = useState<boolean>(false);

    const contextValues: AppContextType = {
        preferences,
        firstLoad,
        firstLoadReady,
        setPreferences,
        setFirstLoad,
        setFirstLoadReady,
    }
    
    useEffect(() => {
        async function rehydrate() {
            const storedState = await getState()
            const storedPreferences = await getPreferences()

            if (storedPreferences !== null && storedPreferences !== "") {
                setPreferences(storedPreferences);
            } else {
                setPreferences("PREFERENCE_NOT_SET");
            }

            if (storedState !== null) {
                setFirstLoad(storedState);
            }

            setFirstLoadReady(true);
        }
        
        rehydrate()
    }, []);

    useEffect(() => {
        if(firstLoadReady){
            storeData(firstLoad, 'firstLoadState');
        }
    }, [firstLoad]);

    useEffect(() => {
        if(firstLoadReady){
            storeData(preferences, 'preferences');
        }
    }, [preferences]);

  return (
    <AppContext.Provider value={contextValues}>
        {props.children}
    </AppContext.Provider>
  )
}

export const useInitContext = () =>{
    return useContext(AppContext); 
}

export default InitContextProvider