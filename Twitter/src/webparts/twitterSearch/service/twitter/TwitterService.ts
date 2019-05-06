import ITweet from '../../model/ITweet';
import { ITwitterService, ITwitterServiceProps } from './ITwitterService';

import { AadHttpClient } from '@microsoft/sp-http';
import { IRawTweet } from './servicePayloads/IRawTweet';

export default class TwitterService implements ITwitterService {

    constructor(
        private serviceProps: ITwitterServiceProps
    ) { }

    public searchTweets(query: string):
        Promise<ITweet[] | string> {

        if (this.serviceProps.context && this.serviceProps.serviceScope &&
            this.serviceProps.clientId && this.serviceProps.searchEndPointUrl) {

            var aadClient: AadHttpClient =
                new AadHttpClient(this.serviceProps.serviceScope, this.serviceProps.clientId);

            return new Promise<ITweet[]>((resolve, reject) => {

                const headers: HeadersInit = new Headers();
                headers.append("Content-Type", "application/json");
                const body = {
                    "hashtag": query
                };

                aadClient.post(this.serviceProps.searchEndPointUrl, AadHttpClient.configurations.v1,
                    {
                        headers: headers,
                        body: JSON.stringify(body)
                    })
                    .then((res: any): Promise<any> => {
                        if (res && !res.ok) {
                            reject(`Error: ${res.status} - ${res.statusText}`);
                        }
                        return res.json();
                    })
                    .then((rawTweets: IRawTweet[]) => {
                        let tweets: ITweet[] = rawTweets.map((value) => {
                            return {
                                text: value.TweetText,
                                from: `${value.UserDetails.FullName} (@${value.TweetedBy}) `,
                                dateTimeSent: new Date(value.CreatedAtIso),
                                imageUrl: value.UserDetails.ProfileImageUrl
                            };
                        });
                        resolve(tweets);
                    })
                    .catch((message) => {
                        reject(message);
                    });
            });
        } else {
            return new Promise<string>((resolve, reject) => {
                reject('Missing or null paraneters in tweet service searchTweets()');
            });
        }

    }

    public postTweet(text: string, query: string, ):
        Promise<null | string> {

        return new Promise<null | string>((resolve => {
            resolve(null);
        }));

    }


    private mockItems =
        [
            {
                "text": "Sock tweet 1",
                "from": "@Sender1",
                "dateTimeSent": new Date(2018, 5, 1, 12, 5, 0, 0),
                "imageUrl": "#"
            },
            {
                "text": "Sock tweet 2",
                "from": "@Sender2",
                "dateTimeSent": new Date(2018, 5, 1, 12, 6, 0, 0),
                "imageUrl": "#"
            },
            {
                "text": "Sock tweet 3",
                "from": "@Sender3",
                "dateTimeSent": new Date(2018, 5, 1, 12, 7, 0, 0),
                "imageUrl": "#"
            }];
}