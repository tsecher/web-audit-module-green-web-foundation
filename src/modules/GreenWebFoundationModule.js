import {AbstractDomainModule} from 'web_audit/dist/domain/AbstractDomainModule.js';
import {ModuleEvents} from 'web_audit/dist/modules/ModuleInterface.js';

/**
 * Green Web Foundation Module events.
 */
export const GreenWebFoundationModuleEvents = {
	createGreenWebFoundationModule: 'green_web_foundation_module__createGreenWebFoundationModule',
	onResult: 'green_web_foundation_module__onResult',
};

/**
 * Green Web Foundation Validator.
 */
export default class GreenWebFoundationModule extends AbstractDomainModule {

	/**
	 * {@inheritdoc}
	 */
	get name() {
		return 'Green Web Foundation';
	}

	/**
	 * {@inheritdoc}
	 */
	get id() {
		return `green_web_foundation`;
	}

	/**
	 * {@inheritdoc}
	 */
	async init(context) {
		this.context = context;

		// Install store.
		this.context.config.storage?.installStore('green_web_foundation', this.context, {
			url: 'URL',
			hosted_by: 'Hosted by', // eslint-disable-line @typescript-eslint/naming-convention
			hosted_by_website: 'Hosted by website', // eslint-disable-line @typescript-eslint/naming-convention
			partner: 'Partner',
			green: 'Green',
			hosted_by_id: 'Hosted by ID', // eslint-disable-line @typescript-eslint/naming-convention
		});

		// Emit.
		this.context.eventBus.emit(GreenWebFoundationModuleEvents.createGreenWebFoundationModule, {module: this});
	}

	/**
	 * {@inheritdoc}
	 */
	async analyseDomain(urlWrapper) {
		try {
			this.context?.eventBus.emit(ModuleEvents.startsComputing, {module: this});

			const result = await this.getBaseResult(urlWrapper.url.hostname);
			result.url = urlWrapper.url.hostname;

			const summary = {
				url: urlWrapper.url.hostname,
				hosted_by: result.hosted_by, // eslint-disable-line @typescript-eslint/naming-convention
				hosted_by_website: result.hosted_by_website, // eslint-disable-line @typescript-eslint/naming-convention
				partner: result.partner,
				green: result.green,
			};

			this.context?.eventBus.emit(GreenWebFoundationModuleEvents.onResult, {
				module: this,
				url: urlWrapper,
				result: result,
			});
			this.context?.eventBus.emit(ModuleEvents.onAnalyseResult, {module: this, url: urlWrapper, result: result});

			this.context?.config?.logger.result(`Green Web Foundation`, summary, urlWrapper.url.toString());
			// @ts-ignore
			this.context?.config?.storage?.one('green_web_foundation', this.context, result);

			this.context?.eventBus.emit(ModuleEvents.endsComputing, {module: this});

			return true;
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	/**
	 * Return base result.
	 * @param domain
	 * @returns {Promise<void>}
	 */
	async getBaseResult(domain) {
		const endpoint = `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`;

		const response = await fetch(endpoint, {method: 'GET'});
		return response.json();
	}

	/**
	 * {@inheritdoc}
	 */
	finish() {
	}

}
