import React, { useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated, View } from "react-native";
import { colors } from "../theme";

export default function VoiceButton({ listening, speaking, onMicPress, onSpeakPress, transcript }) {
  const pulse = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (listening || speaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [listening, speaking, pulse]);

  return (
    <View style={s.wrapper}>
      {transcript ? (
        <View style={s.bubble}>
          <Text style={s.bubbleText} numberOfLines={2}>
            {listening ? "🎤 " : speaking ? "🔊 " : "💬 "}{transcript}
          </Text>
        </View>
      ) : null}
      <View style={s.row}>
        {/* Кнопка TTS — говорилка */}
        <Animated.View style={speaking && { transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            style={[s.btn, s.btnSmall, speaking && { backgroundColor: colors.gold }]}
            onPress={onSpeakPress}
            activeOpacity={0.8}
          >
            <Text style={s.icon}>{speaking ? "⏹" : "🔊"}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Кнопка мікрофона */}
        <Animated.View style={listening && { transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            style={[s.btn, listening && s.btnActive]}
            onPress={onMicPress}
            activeOpacity={0.8}
          >
            <Text style={s.icon}>{listening ? "⏹" : "🎤"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper:  { position: "absolute", bottom: 24, right: 20, alignItems: "flex-end", zIndex: 999 },
  row:      { flexDirection: "row", gap: 10 },
  btn:      { width: 56, height: 56, borderRadius: 28,
              backgroundColor: colors.cyan, justifyContent: "center",
              alignItems: "center", shadowColor: colors.cyan,
              shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5,
              shadowRadius: 8, elevation: 8 },
  btnSmall: { backgroundColor: "#2a2a2a", shadowColor: "#000" },
  btnActive:{ backgroundColor: colors.red },
  icon:     { fontSize: 24 },
  bubble:   { backgroundColor: colors.card, borderRadius: 10, padding: 8,
              marginBottom: 8, maxWidth: 240, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.white, fontSize: 12, lineHeight: 16 },
});
