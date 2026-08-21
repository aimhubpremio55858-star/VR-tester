package com.vrbox.mr;


/*
 * =========================================================
 *
 *                 VR BOX MIXED REALITY
 *
 *                 MainActivity.java
 *
 * =========================================================
 *
 * Funções:
 *
 *  - WebView
 *  - JavaScript
 *  - Câmera
 *  - Permissão da câmera
 *  - Hand Tracking via JavaScript
 *  - Sensores 3DoF
 *  - Gyroscope
 *  - Accelerometer
 *  - Tela imersiva
 *  - Comunicação Java -> JavaScript
 *  - Comunicação JavaScript -> Java
 *  - Controle do ciclo de vida
 *  - Prevenção de tela desligar
 *
 * =========================================================
 */


import android.Manifest;

import android.app.Activity;

import android.os.Bundle;

import android.os.Build;

import android.os.Handler;

import android.os.Looper;

import android.os.PowerManager;

import android.content.Context;

import android.content.pm.PackageManager;

import android.hardware.Sensor;

import android.hardware.SensorEvent;

import android.hardware.SensorEventListener;

import android.hardware.SensorManager;

import android.view.View;

import android.view.Window;

import android.view.WindowManager;

import android.webkit.CookieManager;

import android.webkit.JavascriptInterface;

import android.webkit.PermissionRequest;

import android.webkit.WebChromeClient;

import android.webkit.WebResourceRequest;

import android.webkit.WebSettings;

import android.webkit.WebView;

import android.webkit.WebViewClient;

import android.widget.Toast;

import android.graphics.Color;

import java.util.Locale;


/*
 * =========================================================
 * CLASSE PRINCIPAL
 * =========================================================
 */

public class MainActivity
        extends Activity
        implements SensorEventListener {


    /*
     * =====================================================
     * CONSTANTES
     * =====================================================
     */

    private static final int
            CAMERA_PERMISSION_REQUEST = 1001;


    /*
     * =====================================================
     * WEBVIEW
     * =====================================================
     */

    private WebView webView;


    /*
     * =====================================================
     * SENSOR MANAGER
     * =====================================================
     */

    private SensorManager sensorManager;


    private Sensor accelerometer;


    private Sensor gyroscope;


    private Sensor rotationSensor;


    /*
     * =====================================================
     * SENSOR 3DOF
     * =====================================================
     */

    private float rotationX = 0.0f;

    private float rotationY = 0.0f;

    private float rotationZ = 0.0f;


    private float[] rotationMatrix =
            new float[9];


    private float[] orientation =
            new float[3];


    /*
     * =====================================================
     * ESTADO DO SISTEMA
     * =====================================================
     */

    private boolean
            cameraPermissionGranted = false;


    private boolean
            webViewReady = false;


    private boolean
            immersiveMode = false;


    private boolean
            systemRunning = false;


    /*
     * =====================================================
     * WAKE LOCK
     * =====================================================
     */

    private PowerManager.WakeLock
            wakeLock;


    /*
     * =====================================================
     * HANDLER
     * =====================================================
     */

    private final Handler
            handler =
            new Handler(
                    Looper.getMainLooper()
            );


    /*
     * =====================================================
     * CALLBACK 3DOF
     * =====================================================
     */

    private final Runnable
            sensorUpdater =
            new Runnable() {

        @Override
        public void run() {

            send3DoFToJavaScript();

            if (systemRunning) {

                handler.postDelayed(
                        this,
                        33
                );

            }

        }

    };


    /*
     * =====================================================
     * ON CREATE
     * =====================================================
     */

    @Override
    protected void onCreate(
            Bundle savedInstanceState
    ) {

        super.onCreate(
                savedInstanceState
        );


        /*
         * Inicializar janela
         */

        configureWindow();


        /*
         * Tela imersiva
         */

        enableImmersiveMode();


        /*
         * Manter tela ligada
         */

        acquireWakeLock();


        /*
         * Inicializar sensores
         */

        initializeSensors();


        /*
         * Inicializar WebView
         */

        initializeWebView();


        /*
         * Verificar câmera
         */

        checkCameraPermission();


        /*
         * Sistema iniciado
         */

        systemRunning = true;


        /*
         * Atualização dos sensores
         */

        handler.post(
                sensorUpdater
        );

    }


    /*
     * =====================================================
     * CONFIGURAR JANELA
     * =====================================================
     */

    private void configureWindow() {

        Window window =
                getWindow();


        /*
         * Fundo preto
         */

        window.setStatusBarColor(
                Color.BLACK
        );


        window.setNavigationBarColor(
                Color.BLACK
        );


        /*
         * Aceleração
         */

        window.addFlags(
                WindowManager.LayoutParams
                        .FLAG_HARDWARE_ACCELERATED
        );


        /*
         * Tela ligada
         */

        window.addFlags(
                WindowManager.LayoutParams
                        .FLAG_KEEP_SCREEN_ON
        );

    }


    /*
     * =====================================================
     * MODO IMERSIVO
     * =====================================================
     */

    private void enableImmersiveMode() {

        View decorView =
                getWindow()
                        .getDecorView();


        int flags =

                View.SYSTEM_UI_FLAG_FULLSCREEN

                |

                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION

                |

                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY

                |

                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN

                |

                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION

                |

                View.SYSTEM_UI_FLAG_LAYOUT_STABLE;


        decorView.setSystemUiVisibility(
                flags
        );


        immersiveMode = true;

    }


    /*
     * =====================================================
     * WAKE LOCK
     * =====================================================
     */

    private void acquireWakeLock() {

        PowerManager powerManager =
                (PowerManager)
                        getSystemService(
                                Context.POWER_SERVICE
                        );


        if (powerManager == null) {

            return;

        }


        wakeLock =
                powerManager.newWakeLock(

                        PowerManager.SCREEN_BRIGHT_WAKE_LOCK
                                |
                        PowerManager.ACQUIRE_CAUSES_WAKEUP,

                        "VRBOX::VRWakeLock"

                );


        if (
                wakeLock != null
                &&
                !wakeLock.isHeld()
        ) {

            wakeLock.acquire();

        }

    }


    /*
     * =====================================================
     * INICIALIZAR SENSORES
     * =====================================================
     */

    private void initializeSensors() {

        sensorManager =
                (SensorManager)
                        getSystemService(
                                Context.SENSOR_SERVICE
                        );


        if (sensorManager == null) {

            return;

        }


        accelerometer =
                sensorManager.getDefaultSensor(
                        Sensor.TYPE_ACCELEROMETER
                );


        gyroscope =
                sensorManager.getDefaultSensor(
                        Sensor.TYPE_GYROSCOPE
                );


        rotationSensor =
                sensorManager.getDefaultSensor(
                        Sensor.TYPE_ROTATION_VECTOR
                );


        /*
         * Registrar sensor de rotação
         */

        if (rotationSensor != null) {

            sensorManager.registerListener(

                    this,

                    rotationSensor,

                    SensorManager
                            .SENSOR_DELAY_GAME

            );

        }

        /*
         * Caso não exista sensor de rotação,
         * usar acelerômetro.
         */

        else if (
                accelerometer != null
        ) {

            sensorManager.registerListener(

                    this,

                    accelerometer,

                    SensorManager
                            .SENSOR_DELAY_GAME

            );

        }


        /*
         * Gyroscope
         */

        if (gyroscope != null) {

            sensorManager.registerListener(

                    this,

                    gyroscope,

                    SensorManager
                            .SENSOR_DELAY_GAME

            );

        }

    }


    /*
     * =====================================================
     * WEBVIEW
     * =====================================================
     */

    private void initializeWebView() {

        webView =
                new WebView(
                        this
                );


        /*
         * Adicionar WebView
         */

        setContentView(
                webView
        );


        /*
         * Configurações
         */

        WebSettings settings =
                webView.getSettings();


        settings.setJavaScriptEnabled(
                true
        );


        settings.setDomStorageEnabled(
                true
        );


        settings.setDatabaseEnabled(
                true
        );


        settings.setAllowFileAccess(
                true
        );


        settings.setAllowContentAccess(
                true
        );


        settings.setJavaScriptCanOpenWindowsAutomatically(
                true
        );


        settings.setSupportMultipleWindows(
                true
        );


        settings.setMediaPlaybackRequiresUserGesture(
                false
        );


        settings.setBuiltInZoomControls(
                false
        );


        settings.setDisplayZoomControls(
                false
        );


        settings.setSupportZoom(
                false
        );


        settings.setLoadWithOverviewMode(
                false
        );


        settings.setUseWideViewPort(
                false
        );


        /*
         * Cache
         */

        settings.setCacheMode(
                WebSettings.LOAD_DEFAULT
        );


        /*
         * User Agent
         */

        settings.setUserAgentString(

                settings.getUserAgentString()

                +

                " VRBOX-MR/1.0"

        );


        /*
         * Cookies
         */

        CookieManager cookieManager =
                CookieManager.getInstance();


        cookieManager.setAcceptCookie(
                true
        );


        if (
                Build.VERSION.SDK_INT
                >= Build.VERSION_CODES.LOLLIPOP
        ) {

            cookieManager.setAcceptThirdPartyCookies(
                    webView,
                    true
            );

        }


        /*
         * Hardware
         */

        webView.setLayerType(
                View.LAYER_TYPE_HARDWARE,
                null
        );


        /*
         * Cliente de navegação
         */

        webView.setWebViewClient(

                new WebViewClient() {

                    @Override
                    public boolean
                    shouldOverrideUrlLoading(

                            WebView view,

                            WebResourceRequest request

                    ) {

                        return false;

                    }


                    @Override
                    public void
                    onPageFinished(

                            WebView view,

                            String url

                    ) {

                        super.onPageFinished(
                                view,
                                url
                        );


                        webViewReady =
                                true;


                        notifyJavaScriptReady();

                    }

                }

        );


        /*
         * Chrome Client
         */

        webView.setWebChromeClient(

                new WebChromeClient() {


                    /*
                     * Permissão de câmera
                     */

                    @Override
                    public void
                    onPermissionRequest(

                            final PermissionRequest request

                    ) {

                        runOnUiThread(

                                new Runnable() {

                                    @Override
                                    public void run() {

                                        if (
                                                Build.VERSION.SDK_INT
                                                >= Build.VERSION_CODES.LOLLIPOP
                                        ) {

                                            if (
                                                    cameraPermissionGranted
                                            ) {

                                                request.grant(
                                                        request.getResources()
                                                );

                                            }

                                        }

                                    }

                                }

                        );

                    }

                }

        );


        /*
         * Interface JavaScript
         */

        webView.addJavascriptInterface(

                new VRBridge(),

                "AndroidVR"

        );

    }


    /*
     * =====================================================
     * PERMISSÃO DA CÂMERA
     * =====================================================
     */

    private void checkCameraPermission() {

        if (
                Build.VERSION.SDK_INT
                >= Build.VERSION_CODES.M
        ) {

            if (
                    checkSelfPermission(
                            Manifest.permission.CAMERA
                    )
                    != PackageManager.PERMISSION_GRANTED
            ) {


                requestPermissions(

                        new String[]{

                                Manifest.permission.CAMERA

                        },

                        CAMERA_PERMISSION_REQUEST

                );

            }

            else {

                cameraPermissionGranted =
                        true;


                loadVR();

            }

        }

        else {

            cameraPermissionGranted =
                    true;


            loadVR();

        }

    }


    /*
     * =====================================================
     * RESULTADO DA PERMISSÃO
     * =====================================================
     */

    @Override
    public void
    onRequestPermissionsResult(

            int requestCode,

            String[] permissions,

            int[] grantResults

    ) {

        super.onRequestPermissionsResult(

                requestCode,

                permissions,

                grantResults

        );


        if (
                requestCode
                ==
                CAMERA_PERMISSION_REQUEST
        ) {


            if (

                    grantResults.length > 0

                    &&

                    grantResults[0]
                    ==
                    PackageManager
                            .PERMISSION_GRANTED

            ) {


                cameraPermissionGranted =
                        true;


                Toast.makeText(

                        this,

                        "📷 Câmera autorizada!",

                        Toast.LENGTH_SHORT

                ).show();


                loadVR();

            }

            else {


                cameraPermissionGranted =
                        false;


                Toast.makeText(

                        this,

                        "❌ A câmera é necessária para MR.",

                        Toast.LENGTH_LONG

                ).show();


                loadVR();

            }

        }

    }


    /*
     * =====================================================
     * CARREGAR VR
     * =====================================================
     */

    private void loadVR() {

        if (webView == null) {

            return;

        }


        webView.loadUrl(

                "file:///android_asset/index.html"

        );

    }


    /*
     * =====================================================
     * INFORMAR JS
     * =====================================================
     */

    private void notifyJavaScriptReady() {

        if (
                webView == null
                ||
                !webViewReady
        ) {

            return;

        }


        final String
                permission =
                cameraPermissionGranted
                        ? "true"
                        : "false";


        runOnUiThread(

                new Runnable() {

                    @Override
                    public void run() {


                        String script =

                                "window.dispatchEvent(" +

                                "new CustomEvent(" +

                                "'androidVRReady'," +

                                "{detail:{camera:" +

                                permission +

                                "}}" +

                                ")" +

                                ");";


                        webView.evaluateJavascript(

                                script,

                                null

                        );

                    }

                }

        );

    }


    /*
     * =====================================================
     * ENVIAR 3DOF PARA JS
     * =====================================================
     */

    private void send3DoFToJavaScript() {

        if (
                webView == null
                ||
                !webViewReady
        ) {

            return;

        }


        final String x =
                String.format(
                        Locale.US,
                        "%.5f",
                        rotationX
                );


        final String y =
                String.format(
                        Locale.US,
                        "%.5f",
                        rotationY
                );


        final String z =
                String.format(
                        Locale.US,
                        "%.5f",
                        rotationZ
                );


        String script =

                "if(window.onAn
