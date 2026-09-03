# Add project specific ProGuard rules here.

# ---- React Native core ----
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.**

# ---- React Native Reanimated ----
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ---- Expo modules ----
-keep class expo.modules.** { *; }
-keep class host.exp.exponent.** { *; }
-dontwarn expo.modules.**

# ---- Firebase ----
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ---- ResQ custom native modules ----
-keep class com.anonymous.ResQ.** { *; }

# ---- Kotlin coroutines & stdlib ----
-dontwarn kotlinx.coroutines.**
-keep class kotlin.** { *; }
-keepattributes *Annotation*

# ---- General reflection safety ----
-keepattributes Signature
-keepattributes EnclosingMethod
-keepattributes InnerClasses
