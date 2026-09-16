package com.example.data.api

import com.example.core.ApiConfig
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

// Request/Response Data Classes matching PostgreSQL/FastAPI structure
data class GoogleAuthRequest(
  val id_token: String,
  val companion_type: String?,
  val companion_name: String?
)

data class RegisterRequest(
  val name: String,
  val email: String,
  val secret_hash: String, // passwords are not transmitted in plain text where possible or hashed on client/server
  val language: String,
  val companion_type: String,
  val companion_name: String,
  val personality_type: String
)

data class LoginRequest(
  val email: String,
  val secret_hash: String
)

data class RefreshRequest(
  val refresh_token: String
)

data class AuthResponse(
  val success: Boolean,
  val access_token: String,
  val refresh_token: String,
  val user: UserDto?
)

data class RefreshResponse(
  val success: Boolean,
  val access_token: String,
  val refresh_token: String
)

data class UserDto(
  val id: Int,
  val name: String,
  val email: String,
  val language: String,
  val companion_type: String,
  val companion_name: String,
  val personality_type: String,
  val created_at: Long
)

interface AuthApiService {
  @POST("auth/google")
  suspend fun loginWithGoogle(@Body request: GoogleAuthRequest): AuthResponse

  @POST("auth/register")
  suspend fun register(@Body request: RegisterRequest): AuthResponse

  @POST("auth/login")
  suspend fun login(@Body request: LoginRequest): AuthResponse

  @POST("auth/refresh")
  suspend fun refreshTokens(@Body request: RefreshRequest): RefreshResponse

  companion object {
    fun create(baseUrl: String = ApiConfig.baseUrl): AuthApiService {
      val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

      val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(ApiConfig.CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .readTimeout(ApiConfig.READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .writeTimeout(ApiConfig.WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .build()

      return Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()
        .create(AuthApiService::class.java)
    }
  }
}
