package com.virtualstudyroom.aiservice.service;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.stereotype.Service;

@Service
public class YouTubeAIService {

    private final OkHttpClient client = new OkHttpClient();

    public String fetchTranscript(String videoId) {

        try {
            String url = "https://youtubetranscript.p.rapidapi.com/?id=" + videoId;

            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .addHeader("X-RapidAPI-Host", "youtubetranscript.p.rapidapi.com")
                    .addHeader("X-RapidAPI-Key", "DUMMY_KEY")
                    .build();

            Response response = client.newCall(request).execute();

            if (!response.isSuccessful()) {
                return null;
            }

            return response.body().string();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
