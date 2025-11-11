package com.expensetracker.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void initialize() {
        try {
            // Check if already initialized
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials;
                
                // Check for Railway/Production environment variable first
                String credentialsJson = System.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON");
                
                if (credentialsJson != null && !credentialsJson.isEmpty()) {
                    // Production: Use JSON from environment variable (Railway)
                    logger.info("🔧 Initializing Firebase from environment variable (Production)");
                    InputStream serviceAccount = new ByteArrayInputStream(
                        credentialsJson.getBytes(StandardCharsets.UTF_8)
                    );
                    credentials = GoogleCredentials.fromStream(serviceAccount);
                } else {
                    // Local: Use service account file
                    logger.info("🔧 Initializing Firebase from file (Local Development)");
                    FileInputStream serviceAccount = new FileInputStream("serviceAccountKey.json");
                    credentials = GoogleCredentials.fromStream(serviceAccount);
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();

                FirebaseApp.initializeApp(options);
                logger.info("✅ Firebase Admin SDK initialized successfully");
            } else {
                logger.info("✅ Firebase Admin SDK already initialized");
            }
        } catch (IOException e) {
            logger.error("❌ Failed to initialize Firebase Admin SDK", e);
            throw new RuntimeException("Failed to initialize Firebase: " + e.getMessage(), e);
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        return FirebaseAuth.getInstance();
    }

    @Bean
    public Firestore firestore() {
        return FirestoreClient.getFirestore();
    }
}
