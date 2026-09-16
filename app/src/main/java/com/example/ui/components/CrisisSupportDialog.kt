package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.*

data class CrisisHelpline(
  val name: String,
  val description: String,
  val phoneNumber: String,
  val availability: String,
  val isEmergency: Boolean = false
)

val HELPLINES_LIST = listOf(
  CrisisHelpline(
    name = "Tele-MANAS (Govt of India)",
    description = "National 24/7 mental health helpline with multi-language psychological counselors",
    phoneNumber = "14416",
    availability = "24/7 • Toll-Free",
    isEmergency = true
  ),
  CrisisHelpline(
    name = "KIRAN Helpline",
    description = "Ministry of Social Justice 24/7 toll-free mental health rehabilitation support",
    phoneNumber = "18005990019",
    availability = "24/7 • Toll-Free"
  ),
  CrisisHelpline(
    name = "Vandrevala Foundation",
    description = "Professional crisis intervention, suicide prevention, and compassionate counseling",
    phoneNumber = "+919999666555",
    availability = "24/7 • Free"
  ),
  CrisisHelpline(
    name = "AASRA Helpline",
    description = "Confidential emotional crisis and suicide prevention helpline",
    phoneNumber = "+919820466726",
    availability = "24/7 • Free"
  ),
  CrisisHelpline(
    name = "988 Suicide & Crisis Lifeline",
    description = "US / International crisis lifeline offering immediate compassionate support",
    phoneNumber = "988",
    availability = "24/7 • Free & Confidential"
  )
)

@Composable
fun CrisisSupportDialog(
  onDismiss: () -> Unit
) {
  val context = LocalContext.current

  fun dialHelpline(number: String) {
    try {
      val intent = Intent(Intent.ACTION_DIAL).apply {
        data = Uri.parse("tel:${number.replace(" ", "")}")
      }
      context.startActivity(intent)
    } catch (e: Exception) {
      // Graceful fallback
    }
  }

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Card(
      modifier = Modifier
        .fillMaxWidth(0.95f)
        .fillMaxHeight(0.85f)
        .padding(16.dp)
        .testTag("crisis_support_dialog"),
      shape = RoundedCornerShape(28.dp),
      colors = CardDefaults.cardColors(containerColor = PureWhite),
      elevation = CardDefaults.cardElevation(defaultElevation = 12.dp)
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(20.dp)
      ) {
        // Header
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Box(
              modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(Color(0xFFFFEBEE)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = Color(0xFFE53935),
                modifier = Modifier.size(22.dp)
              )
            }
            Column {
              Text(
                text = "Crisis Support",
                fontFamily = PoppinsFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = QuietCharcoal
              )
              Text(
                text = "You are never alone. Help is available.",
                fontSize = 12.sp,
                color = Color(0xFFE53935),
                fontWeight = FontWeight.Medium
              )
            }
          }

          IconButton(
            onClick = onDismiss,
            modifier = Modifier.testTag("close_crisis_dialog")
          ) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = SoftSlate)
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Compassion notice banner
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = Color(0xFFFFF3E0),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Favorite,
              contentDescription = null,
              tint = Color(0xFFE65100),
              modifier = Modifier.size(20.dp)
            )
            Text(
              text = "If you are experiencing severe distress or thoughts of self-harm, please connect with a trained professional immediately. These helplines are 100% free, confidential, and active right now.",
              fontSize = 12.sp,
              lineHeight = 17.sp,
              color = Color(0xFF5D4037)
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Helplines list
        LazyColumn(
          modifier = Modifier
            .weight(1f)
            .fillMaxWidth(),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          items(HELPLINES_LIST) { helpline ->
            Card(
              modifier = Modifier
                .fillMaxWidth()
                .clickable { dialHelpline(helpline.phoneNumber) }
                .testTag("helpline_card_${helpline.phoneNumber}"),
              shape = RoundedCornerShape(18.dp),
              colors = CardDefaults.cardColors(
                containerColor = if (helpline.isEmergency) Color(0xFFFFFAFA) else CalmingBackground
              ),
              border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (helpline.isEmergency) Color(0xFFFFCDD2) else SoftSlate.copy(alpha = 0.2f)
              )
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
              ) {
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = helpline.name,
                    fontFamily = PoppinsFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = QuietCharcoal
                  )
                  Text(
                    text = helpline.description,
                    fontSize = 12.sp,
                    color = SoftSlate,
                    lineHeight = 16.sp,
                    modifier = Modifier.padding(vertical = 2.dp)
                  )
                  Text(
                    text = "● ${helpline.availability}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = SageGreen
                  )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Button(
                  onClick = { dialHelpline(helpline.phoneNumber) },
                  colors = ButtonDefaults.buttonColors(
                    containerColor = if (helpline.isEmergency) Color(0xFFE53935) else SageGreen
                  ),
                  shape = RoundedCornerShape(14.dp),
                  contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                ) {
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                  ) {
                    Icon(
                      imageVector = Icons.Default.Phone,
                      contentDescription = null,
                      modifier = Modifier.size(16.dp),
                      tint = Color.White
                    )
                    Text(
                      text = "Call",
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      color = Color.White
                    )
                  }
                }
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Return button
        OutlinedButton(
          onClick = onDismiss,
          modifier = Modifier
            .fillMaxWidth()
            .height(46.dp)
            .testTag("dismiss_crisis_button"),
          shape = RoundedCornerShape(16.dp),
          colors = ButtonDefaults.outlinedButtonColors(contentColor = QuietCharcoal)
        ) {
          Text("Return to Sanctuary", fontWeight = FontWeight.Medium)
        }
      }
    }
  }
}
