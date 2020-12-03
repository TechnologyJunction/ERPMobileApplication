import React, { Component } from 'react';
import {
  StatusBar,
  View,
  ToastAndroid,
  Button,
  Text
} from 'react-native';
import { WebView } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';
import {
  getDataValue,
  storeData
} from './app/asyncstorage';
import {
  IS_REGISTERED,
  BASE_URL
} from './app/constants';
import Loader from './app/Loader';

let userID = ''

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isError: false,
      lastURL: BASE_URL
    }

    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('onNotificationOpenedApp:', remoteMessage);
      if (remoteMessage) {
        this.setState({
          lastURL: remoteMessage.data.url
        })
        console.log('Open from quit state:', remoteMessage);
      }
    });

    // Check whether an initial notification is available
    messaging().getInitialNotification().then(remoteMessage => {
      console.warn('New app open: ', remoteMessage)
      if (remoteMessage) {
        this.setState({
          lastURL: remoteMessage.data.url
        })
        console.log('Open from quit state:', remoteMessage);
      }
      // setLoading(false);
    });

    // messaging().onMessage(remoteMessage => {
    //   console.log('onMessage:', remoteMessage.data.url);
    //   this.setState({
    //     lastURL: remoteMessage.data.url
    //   })
    // });

  }

  // componentDidMount() {
  //   BackHandler.addEventListener('hardwareBackPress', this.backHandler);
  // }
  // componentWillUnmount() {
  //   BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
  // }
  // backHandler = () => {
  //   if (this.state.backButtonEnabled) {
  //     this.refs[WEBVIEW_REF].goBack();
  //     return true;
  //   }
  // }

  render() {

    return (
      <View style={{
        flex: 1
      }}>
        <StatusBar barStyle="dark-content" />
        <View style={{
          flex: 1
        }}>

          {this.state.isError &&
            <View style={{
              flex: 1,
              justifyContent: 'center',
              padding: 30
            }}>
              <Text style={{
                marginBottom: 30
              }}>
                Oooops! something is not quite right. Please retry!
              </Text>

              <Button
                onPress={() => {
                  this.setState({
                    isLoading: true,
                    isError: false
                  })
                }}
                title='Retry' />

            </View>
          }

          {
            !this.state.isError &&
            <WebView
              // ref={(webView) => { this.webView.ref = webView; }}
              onError={(event) => {
                this.setState({
                  isError: true,
                  isLoading: false
                })
              }}
              javaScriptEnabled={true}
              source={{ uri: this.state.lastURL }}
              onNavigationStateChange={(webViewState) => {

                // this.webView.canGoBack = navState.canGoBack;

                if (this.state.isLoading) {
                  this.setState({
                    isLoading: false,
                    isError: false
                  })
                }
                if (this.state.isError) {
                  this.setState({
                    isError: false
                  })
                }

                const url = webViewState.url

                if (userID == '' && url.includes('userid')) {
                  const array = url.split('&')
                  userID = array[0].split('=')[1]
                  this.registerDevice(userID);
                }
              }}

            />
          }

        </View>

        {this.state.isLoading && <Loader />}

      </View>
    )
  }

  registerDevice = async (userID) => {
    getDataValue(IS_REGISTERED).then((response) => {
      const isUserRegistered = response;
      console.warn('isUserRegistered: ', isUserRegistered)

      if (isUserRegistered == null) {
        this.generateDeviceToken(userID);
      } else {
        console.warn('this user is already registered...')
      }
    }
    )
  }

  sendTokenOnServer = async (token) => {

    let formData = new FormData();
    formData.append('UserID', userID);
    formData.append('Token', token);
    formData.append('SecurityToken', 10298);

    console.warn('formData: ', formData)

    fetch(BASE_URL + ':8081/api/UserToken/UserTokenInsert', {
      method: 'POST',
      body: formData
    })
      .then((res) => res.json())
      .then((json) => {
        console.warn('json: ', json)
        if (json.StatusCode == 200) {
          console.warn('user created successfully.')
          ToastAndroid.show('Device registered successfully.', ToastAndroid.LONG)

          storeData(IS_REGISTERED, 'true')

        } else {
          console.warn('user creation failed.')
        }
      })

      .catch((reason) => {
        ToastAndroid(`Failed to register: ${reason}`, ToastAndroid.LONG)
        console.warn('Failed to register: ', reason)
      })

  }

  generateDeviceToken = async (userID) => {

    // this is needed to show push alerts
    await messaging().registerDeviceForRemoteMessages();

    messaging().getToken().then((token) => {
      console.warn('token: ', token)
      this.sendTokenOnServer(token);
    })
  }

}  