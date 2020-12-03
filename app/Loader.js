import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

const { width, height } = Dimensions.get('window');

export default class Loader extends Component {

    render() {

        const { isLoading } = this.props;

        return (
            <View style={styles.loaderOverlay}>
                <View style={styles.loaderOverlayIn} />
                <View>
                    <ActivityIndicator size="large" color="black" />
                </View>
            </View>
        );
    }
}

Loader.propTypes = {
    isLoading: PropTypes.bool
};

const styles = StyleSheet.create({
    loaderOverlay: {
        elevation: 16,
        zIndex: 101,
        position: 'absolute',
        width: width,
        elevation: 16,//Because loader is supposed to be on top of all views
        height: Platform.OS == 'ios' ? height : (StatusBar.currentHeight > 24 ? height + StatusBar.currentHeight : height),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderOverlayIn: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        // flex: 1,
        color: 'black',
        opacity: 0.2,
        backgroundColor: 'black',
        width: width,
        // height: height,
        height: Platform.OS == 'ios' ? height :
            (StatusBar.currentHeight > 24 ? height + StatusBar.currentHeight : height),
    },
})