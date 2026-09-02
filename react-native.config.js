module.exports = {
  dependencies: {
    'react-native-iap': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-iap/android',
          packageImportPath: 'import com.dooboolab.rniap.ReactNativeIapPackage;',
          packageInstance: 'new ReactNativeIapPackage()',
          buildTypes: ['debug', 'release'],
          componentDescriptors: [],
          cmakeListsFilename: '',
        },
      },
    },
  },
};
