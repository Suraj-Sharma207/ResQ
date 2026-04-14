package expo.modules.directsms

import android.telephony.SmsManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoDirectSmsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoDirectSms")

    AsyncFunction("sendSMS") { phoneNumber: String, message: String ->
      try {
        // Get the default SMS manager for the device
        val smsManager = SmsManager.getDefault()
        
        // Send the SMS silently
        smsManager.sendTextMessage(phoneNumber, null, message, null, null)
        
        return@AsyncFunction "Sent to $phoneNumber"
      } catch (e: Exception) {
        throw Exception("Failed to send SMS: ${e.message}")
      }
    }
  }
}