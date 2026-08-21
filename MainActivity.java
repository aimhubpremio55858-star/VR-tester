package com.vrbox.mr;

import android.Manifest;
import android.app.Activity;
import android.os.Bundle;
import android.content.pm.PackageManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView webView;

    private static final int CAMERA_PERMISSION = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);

        // Permissão da câmera
        if (
            checkSelfPermission(
                Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED
        ) {

            requestPermissions(
                new String[]{
                    Manifest.permission.CAMERA
                },
                CAMERA_PERMISSION
            );
        }


        // WebView
        webView =
            new WebView(this);


        WebSettings settings =
            webView.getSettings();


        settings.setJavaScriptEnabled(true);

        settings.setDomStorageEnabled(true);

        settings.setMediaPlaybackRequiresUserGesture(
            false
        );


        webView.setWebViewClient(
            new WebViewClient()
        );


        webView.setWebChromeClient(
            new WebChromeClient() {

                @Override
                public void onPermissionRequest(
                    PermissionRequest request
                ) {

                    runOnUiThread(() -> {

                        request.grant(
                            request.getResources()
                        );

                    });

                }

            }
        );


        webView.loadUrl(
            "file:///android_asset/index.html"
        );


        setContentView(webView);
    }
}
