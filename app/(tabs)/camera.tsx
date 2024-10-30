import PhotoPreviewSection from '@/components/PhotoPreviewSection';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<'on' | 'off'>('off'); // Flash state
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlashMode(current => (current === 'off' ? 'on' : 'off'));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
        flashMode: flashMode,
      };
      const takedPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(takedPhoto);
    }
  };

  const handleRetakePhoto = () => setPhoto(null);

  if (photo) return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} />;

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} flashMode={flashMode}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name='retweet' size={44} color='black' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleFlash}>
            <MaterialIcons
              name={flashMode === 'off' ? 'flash-off' : 'flash-on'}
              size={44}
              color='black'
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name='camera' size={44} color='black' />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute', // Positioning at the bottom
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'gray',
    borderRadius: 10,
    padding: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});



// import PhotoPreviewSection from '@/components/PhotoPreviewSection';
// import { AntDesign } from '@expo/vector-icons';
// import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
// import { useRef, useState } from 'react';
// import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// export default function Camera() {
//   const [facing, setFacing] = useState<CameraType>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const [photo, setPhoto] = useState<any>(null);
//   const cameraRef = useRef<CameraView | null>(null);

//   if (!permission) {
//     // Camera permissions are still loading.
//     return <View />;
//   }

//   if (!permission.granted) {
//     // Camera permissions are not granted yet.
//     return (
//       <View style={styles.container}>
//         <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
//         <Button onPress={requestPermission} title="grant permission" />
//       </View>
//     );
//   }

//   function toggleCameraFacing() {
//     setFacing(current => (current === 'back' ? 'front' : 'back'));
//   }

//   const handleTakePhoto =  async () => {
//     if (cameraRef.current) {
//         const options = {
//             quality: 1,
//             base64: true,
//             exif: false,
//         };
//         const takedPhoto = await cameraRef.current.takePictureAsync(options);

//         setPhoto(takedPhoto);
//     }
//   }; 

//   const handleRetakePhoto = () => setPhoto(null);

//   if (photo) return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} />

//   return (
//     <View style={styles.container}>
//       <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
//             <AntDesign name='retweet' size={44} color='black' />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
//             <AntDesign name='camera' size={44} color='black' />
//           </TouchableOpacity>
//         </View>
//       </CameraView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   camera: {
//     flex: 1,
//   },
//   buttonContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: 'transparent',
//     margin: 64,
//   },
//   button: {
//     flex: 1,
//     alignSelf: 'flex-end',
//     alignItems: 'center',
//     marginHorizontal: 10,
//     backgroundColor: 'gray',
//     borderRadius: 10,
//   },
//   text: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//   },
// });


