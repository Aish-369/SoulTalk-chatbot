package com.example.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.*
import kotlinx.coroutines.delay

enum class BreathPhase(val label: String, val instruction: String, val targetScale: Float, val durationSeconds: Int) {
  Inhale("Inhale", "Breathe in slowly through your nose...", 1.4f, 4),
  Hold("Hold", "Gently hold this peaceful breath...", 1.4f, 4),
  Exhale("Exhale", "Release and blow away the tension...", 0.85f, 4),
  Rest("Rest", "Rest and prepare for the next wave...", 1.0f, 2)
}

@Composable
fun BreathingExerciseDialog(
  companionName: String = "Wolfie",
  onDismiss: () -> Unit,
  onSessionComplete: (xpEarned: Int) -> Unit
) {
  var secondsLeft by remember { mutableIntStateOf(180) } // 3 minutes total
  var phase by remember { mutableStateOf(BreathPhase.Inhale) }
  var phaseTimer by remember { mutableIntStateOf(phase.durationSeconds) }
  var cyclesCompleted by remember { mutableIntStateOf(0) }
  var isCompleted by remember { mutableStateOf(false) }

  // Animated breath scaling
  val animatedScale by animateFloatAsState(
    targetValue = phase.targetScale,
    animationSpec = tween(
      durationMillis = phase.durationSeconds * 1000,
      easing = FastOutSlowInEasing
    ),
    label = "breath_scale"
  )

  // Infinite subtle ambient glow pulse
  val infiniteTransition = rememberInfiniteTransition(label = "pulse_transition")
  val pulseAlpha by infiniteTransition.animateFloat(
    initialValue = 0.3f,
    targetValue = 0.7f,
    animationSpec = infiniteRepeatable(
      animation = tween(2500, easing = EaseInOutCubic),
      repeatMode = RepeatMode.Reverse
    ),
    label = "ambient_glow"
  )

  // Heartbeat timer ticker
  LaunchedEffect(isCompleted) {
    while (!isCompleted && secondsLeft > 0) {
      delay(1000L)
      if (phaseTimer <= 1) {
        // Next phase transition
        when (phase) {
          BreathPhase.Inhale -> {
            phase = BreathPhase.Hold
            phaseTimer = BreathPhase.Hold.durationSeconds
          }
          BreathPhase.Hold -> {
            phase = BreathPhase.Exhale
            phaseTimer = BreathPhase.Exhale.durationSeconds
          }
          BreathPhase.Exhale -> {
            phase = BreathPhase.Rest
            phaseTimer = BreathPhase.Rest.durationSeconds
          }
          BreathPhase.Rest -> {
            phase = BreathPhase.Inhale
            phaseTimer = BreathPhase.Inhale.durationSeconds
            cyclesCompleted += 1
          }
        }
      } else {
        phaseTimer -= 1
      }

      secondsLeft -= 1
      if (secondsLeft <= 0) {
        isCompleted = true
        onSessionComplete(35) // 35 XP gained
      }
    }
  }

  val minutes = secondsLeft / 60
  val seconds = secondsLeft % 60
  val formattedTime = String.format("%d:%02d", minutes, seconds)

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Card(
      modifier = Modifier
        .fillMaxWidth(0.92f)
        .wrapContentHeight()
        .padding(16.dp)
        .testTag("breathing_exercise_dialog"),
      shape = RoundedCornerShape(32.dp),
      colors = CardDefaults.cardColors(containerColor = PureWhite),
      elevation = CardDefaults.cardElevation(defaultElevation = 12.dp)
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        // Top row with close button
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
                .size(42.dp)
                .clip(CircleShape)
                .background(SoftSkyBlue.copy(alpha = 0.2f)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.Spa,
                contentDescription = null,
                tint = SoftSkyBlue,
                modifier = Modifier.size(24.dp)
              )
            }
            Column {
              Text(
                text = "Breathing Wave",
                fontFamily = PoppinsFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = QuietCharcoal
              )
              Text(
                text = "Sync rhythm with $companionName",
                fontSize = 12.sp,
                color = SoftSlate
              )
            }
          }

          IconButton(
            onClick = onDismiss,
            modifier = Modifier.testTag("close_breathing_dialog")
          ) {
            Icon(
              imageVector = Icons.Default.Close,
              contentDescription = "Close",
              tint = SoftSlate
            )
          }
        }

        Spacer(modifier = Modifier.height(28.dp))

        if (!isCompleted) {
          // Central Breathing Circle
          Box(
            modifier = Modifier
              .size(220.dp)
              .testTag("breathing_visual_circle"),
            contentAlignment = Alignment.Center
          ) {
            // Outer ambient glow ring
            Box(
              modifier = Modifier
                .size(210.dp)
                .scale(animatedScale)
                .clip(CircleShape)
                .background(
                  Brush.radialGradient(
                    colors = listOf(
                      SoftLavender.copy(alpha = pulseAlpha * 0.4f),
                      SoftSkyBlue.copy(alpha = pulseAlpha * 0.2f),
                      Color.Transparent
                    )
                  )
                )
            )

            // Middle ring
            Box(
              modifier = Modifier
                .size(170.dp)
                .scale(animatedScale * 0.95f)
                .clip(CircleShape)
                .background(
                  Brush.radialGradient(
                    colors = listOf(
                      SoftSkyBlue.copy(alpha = 0.35f),
                      LavenderGlow.copy(alpha = 0.15f)
                    )
                  )
                )
                .border(2.dp, SoftLavender.copy(alpha = 0.5f), CircleShape)
            )

            // Inner core
            Box(
              modifier = Modifier
                .size(120.dp)
                .clip(CircleShape)
                .background(
                  Brush.radialGradient(
                    colors = listOf(
                      PureWhite,
                      SoftLavender.copy(alpha = 0.25f)
                    )
                  )
                )
                .shadow(elevation = 6.dp, shape = CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                  text = phase.label,
                  fontFamily = PoppinsFamily,
                  fontWeight = FontWeight.Bold,
                  fontSize = 20.sp,
                  color = QuietCharcoal
                )
                Text(
                  text = "${phaseTimer}s",
                  fontSize = 14.sp,
                  fontWeight = FontWeight.SemiBold,
                  color = SageGreen
                )
              }
            }
          }

          Spacer(modifier = Modifier.height(24.dp))

          // Guided Phase Instruction
          Text(
            text = phase.instruction,
            fontFamily = PoppinsFamily,
            fontWeight = FontWeight.Medium,
            fontSize = 15.sp,
            color = QuietCharcoal,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
          )

          Spacer(modifier = Modifier.height(16.dp))

          // Timer & Cycle Pills
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              shape = RoundedCornerShape(16.dp),
              color = CalmingBackground,
              modifier = Modifier.padding(horizontal = 6.dp)
            ) {
              Text(
                text = "Time Left: $formattedTime",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = SoftSlate,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
              )
            }
            Surface(
              shape = RoundedCornerShape(16.dp),
              color = SageGlow.copy(alpha = 0.4f),
              modifier = Modifier.padding(horizontal = 6.dp)
            ) {
              Text(
                text = "Cycles: $cyclesCompleted",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = SageGreen,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(24.dp))

          // Quick Complete Button
          OutlinedButton(
            onClick = {
              isCompleted = true
              onSessionComplete(35)
            },
            shape = RoundedCornerShape(20.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = SageGreen),
            modifier = Modifier.testTag("finish_breathing_early_button")
          ) {
            Text("Complete Early (+35 XP)")
          }
        } else {
          // Completed State
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(vertical = 12.dp)
          ) {
            Icon(
              imageVector = Icons.Default.CheckCircle,
              contentDescription = null,
              tint = SageGreen,
              modifier = Modifier.size(64.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
              text = "Mindful Wave Completed!",
              fontFamily = PoppinsFamily,
              fontWeight = FontWeight.Bold,
              fontSize = 20.sp,
              color = QuietCharcoal,
              textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
              text = "$companionName feels your inner serenity deepening. You earned 35 Companion XP!",
              fontSize = 14.sp,
              color = SoftSlate,
              textAlign = TextAlign.Center,
              modifier = Modifier.padding(horizontal = 16.dp)
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(
              onClick = onDismiss,
              colors = ButtonDefaults.buttonColors(containerColor = SageGreen),
              shape = RoundedCornerShape(20.dp),
              modifier = Modifier
                .fillMaxWidth(0.7f)
                .height(48.dp)
                .testTag("breathing_done_button")
            ) {
              Text(
                text = "Return to Sanctuary",
                fontWeight = FontWeight.SemiBold,
                color = Color.White
              )
            }
          }
        }
      }
    }
  }
}
