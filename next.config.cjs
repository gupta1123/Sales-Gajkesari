// next.config.js or next.config.cjs
module.exports = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = { fs: false };
        }

        // Add a rule to include transpilation of specific node_modules
        config.module.rules.push({
            test: /\.m?js$/,
            include: /node_modules\/rc-util\/es/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-transform-runtime'],
                },
            },
        });

        return config;
    },
};
