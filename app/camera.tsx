import React, { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { TouchableOpacity, View, StyleSheet, Dimensions } from "react-native";

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (uploading) {
    console.log("Started capturing images...");
    interval = setInterval(() => {
      handleTakePhoto();
    }, 1000);
    }
    else {
      console.log("Stopped capturing images.");
      if (interval) {
        clearInterval(interval);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploading]);

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true };
      const photo = await cameraRef.current.takePictureAsync(options);

      if (photo) {
        const base64Img = `data:image/jpg;base64,${photo.base64}`;
        const data = { file: base64Img, lang: "Marathi" };

        try {
          await fetch(
            "https://1572-150-129-131-188.ngrok-free.app/generate-description",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          );
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <View style={styles.innerButton} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setUploading(!uploading)}
        >
          <View
            style={uploading ? styles.innerButtonActive : styles.innerButton}
          />
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}

const WINDOW_HEIGHT = Dimensions.get("window").height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  camera: { flex: 1 },
  button: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: CAPTURE_SIZE + 10,
    height: CAPTURE_SIZE + 10,
    borderRadius: CAPTURE_SIZE / 2,
    backgroundColor: "#5A45FF",
    justifyContent: "center",
    alignItems: "center",
  },
  innerButton: {
    width: CAPTURE_SIZE,
    height: CAPTURE_SIZE,
    borderRadius: CAPTURE_SIZE / 2,
    backgroundColor: "white",
  },
  innerButtonActive: {
    width: CAPTURE_SIZE,
    height: CAPTURE_SIZE,
    borderRadius: CAPTURE_SIZE / 2,
    backgroundColor: "red",
  },
});
