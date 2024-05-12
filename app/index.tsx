import {useState, useEffect, useCallback } from 'react';
import { ButtonAnimatedWithChild } from './CommonComponents/ButtonAnimated';
import { Text, View } from '@/components/Themed';
import { StyleSheet, TextInput } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import ToastManager, { Toast } from 'toastify-react-native'
import apiRoute from '../apiRoute';
import axios from 'axios';
import { save, getValueFor } from '../ExpoStoreUtils';
import PageTitle from './CommonComponents/PageTitle';

/* This squiggly little bastard won't go away no matter what I do. 
    Why? has I ever? */
import TextBox from 'react-native-password-eye'; 

export default function Login() {
    const [username, setUsername] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);
    const [isLoginSuccess, setIsLoginSuccess] = useState(false);

    useEffect(() => {
        if(showError) 
            Toast.error('An error ocurred', 'top');
    }, [showError])

    useEffect(() => {
        getValueFor('token').then((value) => {}).catch((error) => {});

        if (accessToken !== null) {
            console.log(`Access token is [${accessToken}]`)

            save('token', accessToken).then(() => {
                console.log('Token saved');
            }).catch(error => {
                console.log(error);
            });
        }

    }, [accessToken]);

    useFocusEffect(
        useCallback(() => {
            //reset the status of showError, username, password, isLoginSuccess when the component is mounted

            getValueFor('logout').then((value : any) => {

                if (value === 'yes') {
                    save('logout', '').then(
                        () => console.log("User logged out")
                    )

                    console.log("remounting");
                    setShowError(false);
                    setUsername(null);
                    setPassword(null);
                    setIsLoginSuccess(false);

                    getValueFor('token').then(
                        async (value) => {
                            if(value){
                                console.log("Previous session value found in secure store")
                                console.log(value);
                                await save('token','');
                                console.log("Removed previous token from secure store")
                            }
                        }
                    ).catch(async (error) => {
                        console.log(error);
                        console.log("Relax about the above error, you are in the mounting phase.")
                        await save('token','');
                        //The token is not stored in the secure store. GOOD.
                    });

                }
                else{
                    console.log("This shouldnt even be possible what the actual fuck")
                }
                
            }).catch((err : any) => {

                console.log("In phase where no logout key exists")
                getValueFor('token').then((value) => {
                    setAccessToken(value);
                    setIsLoginSuccess(true); 
                }).catch((err) => {
                    console.log(err);
                    console.log("Ignore the above error, you are in the mounting phase.")
                })
            });

            /* At this point, the "token" in secure store is either undefined or ''
            If the token is undefined, set it to ''  -- why? -- BECAUSE YOU CAN ONLY STORE EMPTY STRINGS NOT UNDEFINED OR NULL VALUES
            */
            }, []))

    const login = async () => {
        let body = {username,password}
        let headers = {
            'Content-Type': 'application/json'
        }
        console.log("Body is")
        console.log(body);
        const response =  await axios.post(`${apiRoute}/jwt/token/`, body, {headers});
        let {refresh, access} = response.data;
        //I wont need refresh token for now
        setAccessToken(access);
        setIsLoginSuccess(true);
    };

    const handleLoginError = (_error : any) => {
        let status_code = _error.response.status;
        if(status_code === 401){
            console.log("Invalid username or password");
            Toast.error('Invalid username or password', 'top');
        }
        setShowError(true);
        setIsLoginSuccess(false);
    }

    const handlePress = async () => {
        if (username === null || password === null) {
            setShowError(false);
            setShowError(true);
            return;
        }

        try{
            await login();
        }
        catch (error: any) {
            handleLoginError(error);
            return;
        }
    }

    useEffect(() => {
        if (isLoginSuccess) {
            //Debug Code : Remove this after integrating with backend
            var passObj = {apiRoute , accessToken};
            Toast.success('Login Successful', 'top');
            setTimeout(() => router.navigate('(tabs)'), 800); //completely unnecessary but looks kinda cool
        }
    }, [isLoginSuccess])

    useEffect(() => {
        if (showError === true) {
            Toast.warn('Try re-entering username and password', 'top');
        }
    }, [showError])

    return (
        
        <View style={styles.container}>
            <View>
                <PageTitle value='Volunteer Login' />
            </View>

            <View>
            <TextInput 
                clearButtonMode="always"
                style={styles.textInputStyle} 
                placeholder="Username"  
                onChangeText={(text) => setUsername(text)}
                placeholderTextColor="white"
            />
            {/* password box */}
            <TextBox 
                onChangeText={(text : string ) => setPassword(text)}
                style={styles.textInputStyleSecure} 
                inputStyle={{color: 'white', fontSize: 16}} 
                placeholder="Password" 
                placeholderTextColor="white"
                secureTextEntry={true}
                eyeColor="white"
            />

            </View>

            <ButtonAnimatedWithChild 
            child={<Text style={styles.PressableText}>Login</Text>}
            onPress={handlePress}
            style={styles.PressableContainer}
            animatedViewStyle={{backgroundColor: '#069a8e'}}
            />

            {/* {showError && <Text style={styles.errorText}>Invalid username or password</Text>} */}

            <ToastManager 
                duration={4000}
                position="bottom" 
                textStyle={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    textAlign: 'center',
                }}
                style={
                    {
                        marginBottom: 20, 
                        marginTop: 40
                    }
                }
                width={325}
                animationStyle="rightInOut"
                positionValue={0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    title: {
        marginTop: 60,
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 1,
        marginBottom: 20,
        height: 1,
        width: '80%',
    },
    textInputStyle: {
        width: 320,
        height: 40,
        borderColor: 'white',
        color: 'white',
        borderWidth: 1,
        margin: 5,
        padding: 5,
        fontSize: 16,
        borderRadius: 5,
        marginBottom: 15,
    },
    textInputStyleSecure: {
        width: 320,
        height: 40,
        borderColor: 'white',
        color: 'white',
        borderWidth: 1,
        margin: 5,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
    },
    PressableContainer: {
        padding: 10,
        borderRadius: 5,
        margin: 10,
        width: 300,
    },
    PressableText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
    }
});
