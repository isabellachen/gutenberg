'use strict';

/**
 * @typedef {import('./config').Config} Config
 * @typedef {import('./config').Source} Source
 */

/**
 * Gets the volume mounts for the specified source objects.
 *
 * @param {Source|Source[]} sources A source or array of source objects.
 * @param {string} wpContentRoot    The wp-content root directory for the source
 *                                  type (e.g. 'mu-plugins').
 * @return {string[]} An array of volume mounts for Docker to consume.
 */
function getVolumeMounts( sources, wpContentRoot ) {
	if ( Array.isArray( sources ) ) {
		return sources.map(
			( source ) =>
				`${ source.path }:/var/www/html/wp-content/${ wpContentRoot }/${ source.basename }`
		);
	}
	// If we have a single Source object, it is the source of truth for the wp-content subdirectory.
	return [ `${ sources.path }:/var/www/html/wp-content/${ wpContentRoot }` ];
}

/**
 * Creates a docker-compose config object which, when serialized into a
 * docker-compose.yml file, tells docker-compose how to run the environment.
 *
 * @param {Config} config A wp-env config object.
 * @return {Object} A docker-compose config object, ready to serialize into YAML.
 */
module.exports = function buildDockerComposeConfig( config ) {
	const pluginMounts = getVolumeMounts( config.pluginSources, 'plugins' );

	const muPluginMounts = getVolumeMounts(
		config.muPluginsSources,
		'mu-plugins'
	);

	const themeMounts = getVolumeMounts( config.themeSources, 'themes' );

	const developmentMounts = [
		`${
			config.coreSource ? config.coreSource.path : 'wordpress'
		}:/var/www/html`,
		...pluginMounts,
		...muPluginMounts,
		...themeMounts,
	];

	const testsMounts = [
		`${
			config.coreSource ? config.coreSource.testsPath : 'tests-wordpress'
		}:/var/www/html`,
		...pluginMounts,
		...themeMounts,
	];

	// Set the default ports based on the config values.
	const developmentPorts = `\${WP_ENV_PORT:-${ config.port }}:80`;
	const testsPorts = `\${WP_ENV_TESTS_PORT:-${ config.testsPort }}:80`;

	// The www-data user in wordpress:cli has a different UID (82) to the
	// www-data user in wordpress (33). Ensure we use the wordpress www-data
	// user for CLI commands.
	// https://github.com/docker-library/wordpress/issues/256
	const cliUser = '33:33';

	return {
		version: '3.7',
		services: {
			mysql: {
				image: 'mariadb',
				environment: {
					MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
				},
				volumes: [ 'mysql:/var/lib/mysql' ],
			},
			wordpress: {
				depends_on: [ 'mysql' ],
				image: 'wordpress',
				ports: [ developmentPorts ],
				environment: {
					WORDPRESS_DB_NAME: 'wordpress',
				},
				volumes: developmentMounts,
			},
			'tests-wordpress': {
				depends_on: [ 'mysql' ],
				image: 'wordpress',
				ports: [ testsPorts ],
				environment: {
					WORDPRESS_DB_NAME: 'tests-wordpress',
				},
				volumes: testsMounts,
			},
			cli: {
				depends_on: [ 'wordpress' ],
				image: 'wordpress:cli',
				volumes: developmentMounts,
				user: cliUser,
			},
			'tests-cli': {
				depends_on: [ 'wordpress' ],
				image: 'wordpress:cli',
				volumes: testsMounts,
				user: cliUser,
			},
			composer: {
				image: 'composer',
				volumes: [ `${ config.configDirectoryPath }:/app` ],
			},
		},
		volumes: {
			...( ! config.coreSource && { wordpress: {} } ),
			...( ! config.coreSource && { 'tests-wordpress': {} } ),
			mysql: {},
		},
	};
};
