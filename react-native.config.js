module.exports = {
  dependencies: {
    // Exclude react-native-vision-camera from autolinking
    'react-native-vision-camera': {
      platforms: {
        android: null, // disable Android platform, otherwise it will autolink if provided
        ios: null, // disable iOS platform, otherwise it will autolink if provided
      },
    },
  },
};

