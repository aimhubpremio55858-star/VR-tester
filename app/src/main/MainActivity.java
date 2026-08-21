package com.vrbox.mr;

import android.Manifest;
import android.app.Activity;
import android.os.Bundle;
import android.content.pm.PackageManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.PermissionRequest;
import android.view.ViewGroup;

public class MainActivity extends Activity {

    private WebView webView;

    private static final int CAMERA_PERMISSION = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);

        WebSettings settings = webView.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        webView.setWebViewClient(new WebViewClient());

        webView.setWebChromeClient(new android.webkit.WebChromeClient() {

            @Override
            public void onPermissionRequest(
                    final PermissionRequest request) {

                runOnUiThread(() -> {

                    if (request.getOrigin()
                            .toString()
                            .startsWith("file://")) {

                        request.grant(
                                request.getResources()
                        );
                    }
                });
            }
        });

        setContentView(webView,
                new ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                ));

        pedirCamera();

        webView.loadUrl(
                "file:///android_asset/index.html"
        );
    }

    private void pedirCamera() {

        if (android.os.Build.VERSION.SDK_INT >= 23) {

            if (checkSelfPermission(
                    Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED) {

                requestPermissions(
                        new String[]{
                                Manifest.permission.CAMERA
                        },
                        CAMERA_PERMISSION
                );
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            String[] permissions,
            int[] results) {

        super.onRequestPermissionsResult(
                requestCode,
                permissions,
                results
        );

        if (requestCode == CAMERA_PERMISSION) {

            if (results.length > 0 &&
                    results[0] ==
                    PackageManager.PERMISSION_GRANTED) {

                webView.reload();
            }
        }
    }

    @Override
    public void onBackPressed() {

        if (webView.canGoBack()) {

            webView.goBack();

        } else {

            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {

        if (webView != null) {

            webView.destroy();
        }

        super.onDestroy();
    }
          }
