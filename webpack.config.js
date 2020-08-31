const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const {NODE_ENV = "production"} = process.env;

module.exports = {
	entry: "./build/index.js",
	mode: NODE_ENV,
	target: "node",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "springstrap.js",
	},
	resolve: {
		extensions: [".js"],
	},
	optimization: {
		minimize: NODE_ENV === "production",
		minimizer: [new TerserPlugin({parallel: 4})],
	},
};
