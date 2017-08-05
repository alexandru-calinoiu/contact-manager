import { inject } from 'aurelia-framework';
import { WebAPI } from './web-api';
import { areEqual } from './utility';
import { ContactUpdated, ContactViewed } from './messages';
import { EventAggregator } from 'aurelia-event-aggregator';

interface Contact {
    firstName: string;
    lastName: string;
    email: string;
}

@inject(WebAPI, EventAggregator)
export class ContactDetail {
    routeConfig;
    contact: Contact;
    originalContact: Contact;

    constructor(private api: WebAPI, private eventAggregator: EventAggregator) { }

    activate(params, routeConfig) {
        this.routeConfig = routeConfig;

        return this.api.getContactDetails(params.id).then(contact => this.updateOriginalContact(contact));
    }

    get canSave() {
        return this.contact.firstName && this.contact.lastName && !this.api.isRequesting;
    }

    save() {
        this.api.saveContact(this.contact).then(contact => this.updateOriginalContact(contact, new ContactUpdated(contact)));
    }

    canDeactivate() {
        if (!areEqual(this.originalContact, this.contact)) {
            let result = confirm('You have unsaved changes. Are you sure you wish to leave?');
            
            if (!result) {
                this.eventAggregator.publish(new ContactViewed(this.contact));
            }

            return result;
        }

        return true;
    }

    private updateOriginalContact(contact, event = new ContactViewed(contact)) {        
            this.contact = <Contact>contact;
            this.routeConfig.navModel.setTitle(this.contact.firstName);
            this.originalContact = JSON.parse(JSON.stringify(this.contact));
            this.eventAggregator.publish(event);
    }
}
