# Matriz de De-Para para Migração Android Studio (Kotlin & Jetpack Compose)

Este documento estabelece o guia oficial de equivalência arquitetural e técnica para transpor a base TypeScript/React Native do **EcoSmart Mobile** para a arquitetura moderna nativa do **Android Studio**.

---

## 1. Mapeamento de Dependências: Ecossistema JS/TS vs. Android Nativo

| Categoria / Recurso | Dependência React Native / Node.js | Equivalente Android Nativo (Gradle Kotlin DSL) | Justificativa Técnica |
| :--- | :--- | :--- | :--- |
| **Plataforma Firebase** | `firebase` (v10/v11 Web SDK) | `platform("com.google.firebase:firebase-bom:33.4.0")` | Garante alinhamento automático de versões estáveis sem conflitos de classpath. |
| **Firebase Auth** | `firebase/auth` | `com.google.firebase:firebase-auth-ktx` + Credential Manager API | Autenticação nativa com suporte a One Tap Google Sign-In e biometria do SO. |
| **Cloud Firestore** | `firebase/firestore` | `com.google.firebase:firebase-firestore-ktx` | Suporte nativo a snapshots assíncronos convertidos em `Flow<T>`. |
| **Cloud Storage** | `firebase/storage` | `com.google.firebase:firebase-storage-ktx` | Upload em segundo plano resiliente a pausas na conexão. |
| **Cliente HTTP / REST** | `fetch` / `axios` | `com.squareup.retrofit2:retrofit:2.11.0` + `okhttp3:logging-interceptor` | Serialização estrita orientada a interfaces com tipagem estática e interceptors. |
| **Serialização JSON** | `JSON.parse` / `JSON.stringify` | `com.google.code.gson:gson` ou `org.jetbrains.kotlinx:kotlinx-serialization-json` | Conversão direta para Data Classes sem reflexão em tempo de execução com KSP. |
| **Persistência Local** | `@react-native-async-storage/async-storage` | `androidx.room:room-runtime:2.6.1` + `androidx.datastore:datastore-preferences:1.1.1` | SQLite relacional indexado com Room e persistência reativa tipo Chave-Valor com DataStore. |
| **Interface com Usuário** | React Native JSX / Flexbox | **Jetpack Compose (Material 3 BOM)** | UI declarativa nativa sem overhead da ponte JavaScript (Bridge). |
| **Injeção de Dependências**| Singletons em módulos TS (`export const svc`) | **Dagger Hilt (`com.google.dagger:hilt-android:2.51.1`)** | Injeção em tempo de compilação com escopos de ciclo de vida (`@ViewModelScoped`, `@Singleton`). |
| **Rotas e Navegação** | State condicional / React Navigation | `androidx.navigation:navigation-compose:2.8.1` | Pilha de navegação integrada ao BackHandler do Android e animações nativas. |
| **Imagens Remotas** | `<Image source={{ uri }} />` | `io.coil-kt:coil-compose:2.7.0` | Carregamento assíncrono com cache em memória e disco nativo do Android. |

---

## 2. Equivalência de Modelos de Dados (TypeScript -> Kotlin)

### 2.1. Modelo `Usuario`
**TypeScript (`shared/models/index.ts`):**
```typescript
export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: 'cidadao' | 'coletor' | 'admin';
  telefone?: string;
  cep?: string;
  endereco?: string;
  veiculo?: string;
  cargo?: string;
};
```

**Kotlin Nativo (`data/model/Usuario.kt`):**
```kotlin
package com.ecosmart.mobile.data.model

import com.google.gson.annotations.SerializedName

data class Usuario(
    @SerializedName("id") val id: String = "",
    @SerializedName("nome") val nome: String = "",
    @SerializedName("email") val email: String = "",
    @SerializedName("perfil") val perfil: PerfilUsuario = PerfilUsuario.CIDADAO,
    @SerializedName("telefone") val telefone: String? = null,
    @SerializedName("cep") val cep: String? = null,
    @SerializedName("endereco") val endereco: String? = null,
    @SerializedName("veiculo") val veiculo: String? = null,
    @SerializedName("cargo") val cargo: String? = null
)
```

---

### 2.2. Modelo `Descarte` (com suporte a Room Database)
**TypeScript (`shared/models/index.ts`):**
```typescript
export type Descarte = {
  id: string;
  userId?: string;
  citizenName: string;
  wasteType: string;
  quantity: string;
  status: 'pendente' | 'coletado';
  createdAt: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  offline?: boolean;
};
```

**Kotlin Nativo (`data/model/Descarte.kt`):**
```kotlin
package com.ecosmart.mobile.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "descartes")
data class Descarte(
    @PrimaryKey
    @SerializedName("id") val id: String = "",
    @SerializedName("userId") val userId: String? = null,
    @SerializedName("citizenName") val citizenName: String = "",
    @SerializedName("wasteType") val wasteType: String = "",
    @SerializedName("quantity") val quantity: String = "",
    @SerializedName("status") val status: String = "pendente",
    @SerializedName("createdAt") val createdAt: String = "",
    @SerializedName("latitude") val latitude: Double = -16.0725,
    @SerializedName("longitude") val longitude: Double = -57.6798,
    @SerializedName("distanceKm") val distanceKm: Double = 0.0,
    @SerializedName("offline") val offline: Boolean = false
) {
    val isCollected: Boolean get() = status.equals("coletado", ignoreCase = true)
}
```

---

## 3. Mapeamento de Chamadas de Rede e Serviços

### 3.1. Chamada REST de Baixa de Coleta em 1 Toque
**TypeScript (`shared/services/crossAppSync.ts`):**
```typescript
await fetch(`${SYNC_SERVER_URL}/api/discards/${discardId}/collect`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ coletorId }),
});
```

**Kotlin com Retrofit e Coroutines (`data/remote/EcoSmartApiService.kt`):**
```kotlin
interface EcoSmartApiService {
    @POST("api/discards/{id}/collect")
    suspend fun markAsCollected(
        @Path("id") id: String,
        @Body payload: Map<String, String>
    ): Response<Map<String, Any>>
}
```

---

### 3.2. Consulta de CEP no ViaCEP
**TypeScript (`shared/services/cepService.ts`):**
```typescript
const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
const data = await res.json();
```

**Kotlin com Retrofit (`data/remote/ViaCepApiService.kt`):**
```kotlin
interface ViaCepApiService {
    @GET("ws/{cep}/json/")
    suspend fun getAddressByCep(@Path("cep") cep: String): Response<ViaCepResponse>
}
```

---

### 3.3. Ouvintes em Tempo Real (onSnapshot -> Kotlin Flow)
**TypeScript (`shared/services/firebaseService.ts`):**
```typescript
const unsubscribe = onSnapshot(query(collection(db, 'descartes')), (snapshot) => {
  const items = snapshot.docs.map(doc => doc.data());
  callback(items);
});
```

**Kotlin Nativo com Firestore KTX (`data/repository/DescarteRepository.kt`):**
```kotlin
fun getDiscardsRealtime(): Flow<List<Descarte>> = callbackFlow {
    val listener = Firebase.firestore.collection("descartes")
        .addSnapshotListener { snapshot, error ->
            if (error != null) {
                close(error)
                return@addSnapshotListener
            }
            val items = snapshot?.toObjects(Descarte::class.java) ?: emptyList()
            trySend(items)
        }
    awaitClose { listener.remove() }
}
```

---

## 4. Padrão Arquitetural MVVM Nativo Recomendado

```text
[View / Composable]
   │
   ▼ (Eventos / Ações do Usuário)
[ViewModel] (@HiltViewModel + StateFlow<UiState>)
   │
   ▼ (Chamadas Assíncronas via Coroutines Dispatchers.IO)
[Repository] (DescarteRepository / AuthRepository)
   ├──► [Room DAO] (Cache SQLite Local Offline-First)
   └──► [Retrofit / Firestore] (Sincronização em Nuvem)
```
