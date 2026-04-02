import React, { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';



export interface AppContextType{
    preferences: string;
    firstLoad?: boolean;
    setPreferences: Dispatch<SetStateAction<string>>;
    setFirstLoad: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const InitContextProvider = (props: any) => {
    const [preferences, setPreferences] = useState<string>("");
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    const contextValues: AppContextType = {
        preferences,
        firstLoad,
        setPreferences,
        setFirstLoad
    }
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