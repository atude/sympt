import React, { useState, useEffect, useRef } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import firebase from './firebase/firebaseInit';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import LoginScreen from './screens/LoginScreen';

import { UserContext, DiseaseContext } from './context/context';

const Stack = createStackNavigator();

export default function App(props) {
	const [isLoadingComplete, setLoadingComplete] = useState(false);
	const [isUserLoadingComplete, setUserLoadingComplete] = useState(false);
	const [initialNavigationState, setInitialNavigationState] = useState();
	const containerRef = useRef();
  const { getInitialState } = useLinking(containerRef);

	const [user, setUser] = useState(firebase.auth().currentUser);
	const [diseaseName, setDisease] = useState("covid-19");

	// Context definers
	const userContextValue = {
		user: user || null,
	};

	const diseaseContextValue = {
		diseaseName,
		setDisease: (newDiseaseName) => setDisease(newDiseaseName),
	};

	console.log(diseaseName);

	// Load any resources or data that we need prior to rendering the app
	useEffect(() => {
		async function loadResourcesAndDataAsync() {
			try {
				SplashScreen.preventAutoHide();

				// Load our initial navigation state
				setInitialNavigationState(await getInitialState());

				// Load fonts
				await Font.loadAsync({
					...Ionicons.font,
					'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
					'open-sans-light': require('./assets/fonts/OpenSans-Light.ttf'),
					'open-sans-semibold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
					'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
					'open-sans-italic': require('./assets/fonts/OpenSans-Italic.ttf'),
					'montserrat-semibold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
					'sfpro': require('./assets/fonts/SFPro-Regular.ttf'),
				});

				// Setup firebase user
				firebase.auth().onAuthStateChanged((currUser) => {
					if (currUser) {
						setUser(currUser);
						console.log("Auth state changed => " + currUser.email);
					} else {
						setUser(null);
					}
					setUserLoadingComplete(true);
				});
			} catch (e) {
				console.warn(e);
			} finally {
				setLoadingComplete(true);
				SplashScreen.hide();
			}
		}

		loadResourcesAndDataAsync();
	}, []);

	if ((!isLoadingComplete || !isUserLoadingComplete) && !props.skipLoadingScreen) {
		return null;
	} else {
		return (
			<View style={styles.container}>
				<UserContext.Provider value={userContextValue}>
					<DiseaseContext.Provider value={diseaseContextValue}>
						<StatusBar barStyle="dark-content" />
						{!user ? (
							<LoginScreen />
						) : (
							<NavigationContainer ref={containerRef} initialState={initialNavigationState}>
								<Stack.Navigator>
									<Stack.Screen name="Root" component={BottomTabNavigator} />
								</Stack.Navigator>
							</NavigationContainer>
						)}
					</DiseaseContext.Provider>
				</UserContext.Provider>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
});