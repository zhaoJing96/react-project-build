'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const ESLintPlugin = require('eslint-webpack-plugin');
const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const postcssNormalize = require('postcss-normalize');

const appPackageJson = require(paths.appPackageJson);

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const webpackDevClientEntry = require.resolve(
    'react-dev-utils/webpackHotDevClient'
);
const reactRefreshOverlayEntry = require.resolve(
    'react-dev-utils/refreshOverlayInterop'
);

// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === 'true';
const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';

const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// Get the path to the uncompiled service worker (if it exists).
const swSrc = paths.swSrc;

// 样式正则
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const hasJsxRuntime = (() => {
    if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
        return false;
    }
    try {
        require.resolve('react/jsx-runtime');
        return true;
    } catch (e) {
        return false;
    }
})();

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function (webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    // Variable used for enabling profiling in Production
    // passed into alias object. Uses a flag if passed into the build command
    const isEnvProductionProfile =
        isEnvProduction && process.argv.includes('--profile');

    // We will provide `paths.publicUrlOrPath` to our app
    // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
    // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
    // Get environment variables to inject into our app.
    const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

    const shouldUseReactRefresh = env.raw.FAST_REFRESH;

    // common function to get style loaders
    const getStyleLoaders = (cssOptions, preProcessor) => {
        const loaders = [
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && {
                loader: MiniCssExtractPlugin.loader,
                // css is located in `static/css`, use '../../' to locate index.html folder
                // in production `paths.publicUrlOrPath` can be a relative path
                options: paths.publicUrlOrPath.startsWith('.')
                    ? { publicPath: '../../' }
                    : {}
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions
            },
            {
                // Options for PostCSS as we reference these options twice
                // Adds vendor prefixing based on your specified browser support in
                // package.json
                loader: require.resolve('postcss-loader'),
                options: {
                    // Necessary for external CSS imports to work
                    // https://github.com/facebook/create-react-app/issues/2677
                    ident: 'postcss',
                    plugins: () => [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-preset-env')({
                            autoprefixer: {
                                flexbox: 'no-2009'
                            },
                            stage: 3
                        }),
                        // Adds PostCSS Normalize as the reset css with default options,
                        // so that it honors browserslist config in package.json
                        // which in turn let's users customize the target behavior as per their needs.
                        postcssNormalize()
                    ],
                    sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment
                }
            }
        ].filter(Boolean);
        if (preProcessor) {
            loaders.push(
                {
                    loader: require.resolve('resolve-url-loader'),
                    options: {
                        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                        root: paths.appSrc
                    }
                },
                {
                    loader: require.resolve(preProcessor),
                    options: {
                        sourceMap: true
                    }
                }
            );
        }
        if (preProcessor && preProcessor === 'less-loader') {
            loaders.push(
                {
                    loader: require.resolve('resolve-url-loader'),
                    options: {
                        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                        root: paths.appSrc
                    }
                },
                {
                    loader: require.resolve(preProcessor),
                    options: {
                        sourceMap: true,
                        lessOptions: {
                            javascriptEnabled: true,
                            modifyVars: {
                                'primary-color': '#1DA57A',
                                'link-color': '#ff4757',
                                'border-radius-base': '2px'
                            }
                        }
                    }
                }
            );
        }
        return loaders;
    };

    return {
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        // Stop compilation early in production
        bail: isEnvProduction,
        devtool: isEnvProduction
            ? shouldUseSourceMap
                ? 'source-map'
                : false
            : isEnvDevelopment && 'cheap-module-source-map',
        // These are the "entry points" to our application.
        // This means they will be the "root" imports that are included in JS bundle.
        entry:
            isEnvDevelopment && !shouldUseReactRefresh
                ? [
                    webpackDevClientEntry,
                    paths.appIndexJs
                ]
                : paths.appIndexJs,
        output: {
            path: isEnvProduction ? paths.appBuild : undefined,
            pathinfo: isEnvDevelopment,
            filename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].js'
                : isEnvDevelopment && 'static/js/bundle.js',
            futureEmitAssets: true,
            chunkFilename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : isEnvDevelopment && 'static/js/[name].chunk.js',
            publicPath: paths.publicUrlOrPath,
            devtoolModuleFilenameTemplate: isEnvProduction
                ? info =>
                    path
                        .relative(paths.appSrc, info.absoluteResourcePath)
                        .replace(/\\/g, '/')
                : isEnvDevelopment &&
                (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
            // Prevents conflicts when multiple webpack runtimes (from different apps)
            // are used on the same page.
            jsonpFunction: `webpackJsonp${appPackageJson.name}`,
            // this defaults to 'window', but by setting it to 'this' then
            // module chunks which are built will work in web workers as well.
            globalObject: 'this'
        },
        optimization: {
            minimize: isEnvProduction, // 仅用于生产环境
            minimizer: [
                // This is only used in production mode
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2
                        },
                        mangle: {
                            safari10: true
                        },
                        // Added for profiling in devtools
                        keep_classnames: isEnvProductionProfile,
                        keep_fnames: isEnvProductionProfile,
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true
                        }
                    },
                    sourceMap: shouldUseSourceMap
                }),
                // 优化或者压缩css资源
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        parser: safePostCssParser,
                        map: shouldUseSourceMap
                            ? {
                                inline: false,
                                annotation: true
                            }
                            : false
                    },
                    cssProcessorPluginOptions: {
                        preset: ['default', { minifyFontValues: { removeQuotes: false } }]
                    }
                })
            ],
            // 主要就是根据不同的策略来分割打包出来的bundle。
            splitChunks: {
                chunks: 'all',
                name: isEnvDevelopment
            },
            // Keep the runtime chunk separated to enable long term caching
            runtimeChunk: {
                name: entrypoint => `runtime-${entrypoint.name}`
            }
        },
        resolve: {
            modules: ['node_modules', paths.appNodeModules].concat(
                modules.additionalModulePaths || []
            ),
            extensions: paths.moduleFileExtensions
                .map(ext => `.${ext}`)
                .filter(ext => useTypeScript || !ext.includes('ts')),
            alias: {
                // Support React Native Web
                // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
                'react-native': 'react-native-web',
                // Allows for better profiling with ReactDevTools
                ...(isEnvProductionProfile && {
                    'react-dom$': 'react-dom/profiling',
                    'scheduler/tracing': 'scheduler/tracing-profiling'
                }),
                ...(modules.webpackAliases || {}),
                // 配置别名
                '@': path.resolve(__dirname, '../src')
            },
            plugins: [
                PnpWebpackPlugin,
                new ModuleScopePlugin(paths.appSrc, [
                    paths.appPackageJson,
                    reactRefreshOverlayEntry
                ])
            ]
        },
        resolveLoader: {
            plugins: [
                PnpWebpackPlugin.moduleLoader(module)
            ]
        },
        module: {
            strictExportPresence: true,
            rules: [
                { parser: { requireEnsure: false } },
                {
                    oneOf: [
                        // 处理媒体文件和图片
                        {
                            test: [/\.avif$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: imageInlineSizeLimit,
                                mimetype: 'image/avif',
                                name: 'static/media/[name].[hash:8].[ext]'
                            }
                        },
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: imageInlineSizeLimit,
                                name: 'static/media/[name].[hash:8].[ext]'
                            }
                        },
                        // 处理js
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                customize: require.resolve(
                                    'babel-preset-react-app/webpack-overrides'
                                ),
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app'),
                                        {
                                            runtime: hasJsxRuntime ? 'automatic' : 'classic'
                                        }
                                    ]
                                ],

                                plugins: [
                                    [
                                        require.resolve('babel-plugin-named-asset-import'),
                                        {
                                            loaderMap: {
                                                svg: {
                                                    ReactComponent:
                                                        '@svgr/webpack?-svgo,+titleProp,+ref![path]'
                                                }
                                            }
                                        }
                                    ],
                                    // 配置使用antd样式
                                    [require.resolve('babel-plugin-import'), { libraryName: 'antd', libraryDirectory: "es", style: true }],
                                    isEnvDevelopment &&
                                    shouldUseReactRefresh &&
                                    require.resolve('react-refresh/babel')
                                ].filter(Boolean),
                                cacheDirectory: true,
                                cacheCompression: false,
                                compact: isEnvProduction
                            }
                        },
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app/dependencies'),
                                        { helpers: true }
                                    ]
                                ],
                                cacheDirectory: true,
                                cacheCompression: false,
                                sourceMaps: shouldUseSourceMap,
                                inputSourceMap: shouldUseSourceMap
                            }
                        },
                        // css
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction
                                    ? shouldUseSourceMap
                                    : isEnvDevelopment
                            }),
                            sideEffects: true
                        },
                        {
                            test: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction
                                    ? shouldUseSourceMap
                                    : isEnvDevelopment,
                                modules: {
                                    getLocalIdent: getCSSModuleLocalIdent
                                }
                            })
                        },
                        // sass
                        {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment
                                },
                                'sass-loader'
                            ),
                            sideEffects: true
                        },
                        {
                            test: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment,
                                    modules: {
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                },
                                'sass-loader'
                            )
                        },
                        // less
                        {
                            test: lessRegex,
                            exclude: lessModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment
                                },
                                'less-loader'
                            ),
                            sideEffects: true
                        },
                        {
                            test: lessModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment,
                                    modules: {
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                },
                                'less-loader'
                            )
                        },
                        // 文件
                        {
                            loader: require.resolve('file-loader'),
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                        inject: true,
                        template: paths.appHtml
                    },
                    isEnvProduction ? {
                        minify: {
                            removeComments: true, // 移除HTML中的注释
                            collapseWhitespace: true,
                            removeRedundantAttributes: true,
                            useShortDoctype: true,
                            removeEmptyAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            keepClosingSlash: true,
                            minifyJS: true,
                            minifyCSS: true, // 压缩内联css
                            minifyURLs: true
                        }
                    }
                        : undefined
                )
            ),
            isEnvProduction &&
            shouldInlineRuntimeChunk &&
            new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
            new ModuleNotFoundPlugin(paths.appPath),
            new webpack.DefinePlugin(env.stringified),
            isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
            isEnvDevelopment &&
            shouldUseReactRefresh &&
            new ReactRefreshWebpackPlugin({
                overlay: {
                    entry: webpackDevClientEntry,
                    // The expected exports are slightly different from what the overlay exports,
                    // so an interop is included here to enable feedback on module-level errors.
                    module: reactRefreshOverlayEntry,
                    // Since we ship a custom dev client and overlay integration,
                    // the bundled socket handling logic can be eliminated.
                    sockIntegration: false
                }
            }),
            // Watcher doesn't work well if you mistype casing in a path so we use
            // a plugin that prints an error when you attempt to do this.
            // See https://github.com/facebook/create-react-app/issues/240
            isEnvDevelopment && new CaseSensitivePathsPlugin(),
            isEnvDevelopment && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
            //处理.css文件
            isEnvProduction && new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
            }),
            // 生成一份资源清单的json文件
            new ManifestPlugin({
                fileName: 'asset-manifest.json',
                publicPath: paths.publicUrlOrPath,
                generate: (seed, files, entrypoints) => {
                    const manifestFiles = files.reduce((manifest, file) => {
                        manifest[file.name] = file.path;
                        return manifest;
                    }, seed);
                    const entrypointFiles = entrypoints.main.filter(
                        fileName => !fileName.endsWith('.map')
                    );

                    return {
                        files: manifestFiles,
                        entrypoints: entrypointFiles
                    };
                }
            }),
            // Moment.js is an extremely popular library that bundles large locale files
            // by default due to how webpack interprets its code. This is a practical
            // solution that requires the user to opt into importing specific locales.
            // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            // You can remove this if you don't use Moment.js:
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            // Generate a service worker script that will precache, and keep up to date,
            // the HTML & assets that are part of the webpack build.
            isEnvProduction &&
            fs.existsSync(swSrc) &&
            new WorkboxWebpackPlugin.InjectManifest({
                swSrc,
                dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
                exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
                // Bump up the default maximum size (2mb) that's precached,
                // to make lazy-loading failure scenarios less likely.
                // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
            }),
            // TypeScript type checking
            useTypeScript &&
            new ForkTsCheckerWebpackPlugin({
                typescript: resolve.sync('typescript', {
                    basedir: paths.appNodeModules
                }),
                async: isEnvDevelopment,
                checkSyntacticErrors: true,
                resolveModuleNameModule: process.versions.pnp
                    ? `${__dirname}/pnpTs.js`
                    : undefined,
                resolveTypeReferenceDirectiveModule: process.versions.pnp
                    ? `${__dirname}/pnpTs.js`
                    : undefined,
                tsconfig: paths.appTsConfig,
                reportFiles: [
                    // This one is specifically to match during CI tests,
                    // as micromatch doesn't match
                    // '../cra-template-typescript/template/src/App.tsx'
                    // otherwise.
                    '../**/src/**/*.{ts,tsx}',
                    '**/src/**/*.{ts,tsx}',
                    '!**/src/**/__tests__/**',
                    '!**/src/**/?(*.)(spec|test).*',
                    '!**/src/setupProxy.*',
                    '!**/src/setupTests.*'
                ],
                silent: true,
                // The formatter is invoked directly in WebpackDevServerUtils during development
                formatter: isEnvProduction ? typescriptFormatter : undefined
            }),
            !disableESLintPlugin &&
            new ESLintPlugin({
                // Plugin options
                extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                failOnError: !(isEnvDevelopment && emitErrorsAsWarnings),
                context: paths.appSrc,
                cache: true,
                cacheLocation: path.resolve(
                    paths.appNodeModules,
                    '.cache/.eslintcache'
                ),
                // ESLint class options
                cwd: paths.appPath,
                resolvePluginsRelativeTo: __dirname,
                baseConfig: {
                    extends: [require.resolve('eslint-config-react-app/base')],
                    rules: {
                        ...(!hasJsxRuntime && {
                            'react/react-in-jsx-scope': 'error'
                        })
                    }
                }
            })
        ].filter(Boolean),
        // Some libraries import Node modules but don't use them in the browser.
        // Tell webpack to provide empty mocks for them so importing them works.
        node: {
            module: 'empty',
            dgram: 'empty',
            dns: 'mock',
            fs: 'empty',
            http2: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        },
        performance: false //关闭性能处理
    };
};
