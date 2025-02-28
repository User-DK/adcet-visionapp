// update styling of buttons remove overlapping//
import React from "react";
import { Audio } from "expo-av";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import { useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
// import { VolumeManager } from 'react-native-volume-manager';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [torchMode, setTorchMode] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [src, setSrc] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [audio, setAudio] = useState<Audio.Sound | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // State to keep track of interval ID
  const [isRecording, setIsRecording] = useState(false);
  const langList = [
    "Bangla",
    "Bengali",
    "English",
    "Gujarati",
    "Marathi",
    "Malayalam",
    "Hindi",
    "Punjabi",
    "Tamil",
    "Telugu",
    "Urdu",
  ];
  const [selectedLang, setSelectedLang] = useState<string>("Marathi");

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startTimer = () => {
    if (intervalId) {
      clearInterval(intervalId); // Clear any existing interval
    }
    const id = setInterval(() => {
      console.log("Timer running...");
      handleTakePhoto();
    }, 15000); // Execute every 1 second
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      stopTimer();
    } else {
      setIsRecording(true);
      startTimer();
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function toggleFlash() {
    setTorchMode((current) => (current === false ? true : false));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
      };
      const takedPhoto = await cameraRef.current.takePictureAsync(options);
      if (takedPhoto) {
        const source = takedPhoto.base64;
        if (source) {
          setIsPreview(true);
          setIsProcessing(true);
          setSrc(source);
          await handleImageUpload(source);
          setIsProcessing(false);
        }
      }
    }
  };

  interface ImageUploadData {
    file: string;
    lang: string;
  }

  interface ApiResponse {
    description: string;
    translated_text: string;
    audio_data: string;
  }

  const handleImageUpload = async (source: string): Promise<void> => {
    let base64Img = `data:image/jpg;base64,${source}`;
    const data: ImageUploadData = {
      file: base64Img,
      lang: selectedLang,
    };

    try {
      const startTime = performance.now();
      const response = await fetch(
        "https://f90f-150-129-131-188.ngrok-free.app/generate-description",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const endTime = performance.now(); // End timing
      const duration = endTime - startTime; // Calculate duration
      console.log(`Fetch request took ${duration} milliseconds`);

      if (response.ok) {
        const data: ApiResponse = await response.json();

        // Set description and translated text from the response
        setDescription(data.description);
        setTranslatedText(data.translated_text);

        // Process base64 audio data for playback
        const audioUri = `data:audio/wav;base64,${data.audio_data}`;
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        setAudio(sound);
      } else {
        console.error("Error generating audio description");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleRetakePhoto = () => {
    setDescription(null);
    setTranslatedText(null);
    setIsPreview(false);
    if (audio) {
      audio.unloadAsync();
      setAudio(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.container_lang}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedLang(value)}
          items={[
            { label: "Bangla", value: "Bangla" },
            { label: "Bengali", value: "Bengali" },
            { label: "English", value: "English" },
            { label: "Gujarati", value: "Gujarati" },
            { label: "Marathi", value: "Marathi" },
            { label: "Malayalam", value: "Malayalam" },
            { label: "Hindi", value: "Hindi" },
            { label: "Punjabi", value: "Punjabi" },
            { label: "Tamil", value: "Tamil" },
            { label: "Telugu", value: "Telugu" },
            { label: "Urdu", value: "Urdu" },
          ]}
          style={pickerSelectStyles}
          value={selectedLang}
        />
      </View>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        enableTorch={torchMode}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRecording}
            style={styles.buttonmain}
          />
          <TouchableOpacity style={styles.button} onPress={toggleFlash}>
            <MaterialIcons
              name={torchMode === false ? "flash-off" : "flash-on"}
              size={40}
              color="white"
            />
          </TouchableOpacity>
        </View>
        {/* {isPreview && ( */}
          {/* <View style={styles.previewContainer}> */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => audio?.replayAsync()}
            >
              <Text style={styles.buttonText}>Repeat Audio</Text>
            </TouchableOpacity>
          {/* </View> */}
        {/* )} */}
      </CameraView>
    </View>
  );
}

const WINDOW_HEIGHT = Dimensions.get("window").height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  previewContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  preview: { width: 300, height: 300, marginBottom: 20 },
  camera: { flex: 1 },
  buttonContainer: {
    position: "absolute",
    flexDirection: "row",
    bottom: 28,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#5A45FF",
    height: CAPTURE_SIZE,
    width: CAPTURE_SIZE,
    borderRadius: Math.floor(CAPTURE_SIZE / 2),
    marginBottom: 50,
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonmain: {
    backgroundColor: "#5A45FF",
    height: CAPTURE_SIZE + 10,
    width: CAPTURE_SIZE + 10,
    borderRadius: Math.floor(CAPTURE_SIZE / 2),
    marginBottom: 28,
    marginHorizontal: 30,
    borderWidth: 5,
    borderColor: "white",
  },
  permissionButton: {
    backgroundColor: "#5A45FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    width: "50%",
    marginTop: 20,
  },

  actionButton: {
    backgroundColor: "#5A45FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 10,
    top: 500,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: { fontSize: 18, fontWeight: "bold", color: "white", padding: 10 },
  container_lang: {
    backgroundColor: "#F5FCFF",
    marginTop: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
  },
});
