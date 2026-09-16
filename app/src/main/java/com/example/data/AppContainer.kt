package com.example.data

import android.content.Context
import com.example.BuildConfig
import com.example.core.ApiConfig
import com.example.data.api.CompanionApiService
import com.example.data.api.AuthApiService
import com.example.data.database.AppDatabase
import com.example.data.repository.CompanionRepository
import com.example.data.repository.AuthRepository

object AppContainer {
  private var repository: CompanionRepository? = null
  private var authRepository: AuthRepository? = null

  fun getRepository(context: Context): CompanionRepository {
    return repository ?: synchronized(this) {
      val db = AppDatabase.getDatabase(context)
      val api = CompanionApiService.create(ApiConfig.baseUrl)
      val repo = CompanionRepository(db.companionDao(), api, context.applicationContext)
      repository = repo
      repo
    }
  }

  fun getAuthRepository(context: Context): AuthRepository {
    return authRepository ?: synchronized(this) {
      val db = AppDatabase.getDatabase(context)
      val authApi = AuthApiService.create(ApiConfig.baseUrl)
      val authRepo = AuthRepository(db.companionDao(), authApi, context.applicationContext)
      authRepository = authRepo
      authRepo
    }
  }
}
