// embed.ts
import { EmojiIdentifierResolvable } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { embedGuilds } from '../../embed/reception';


interface promptArgs {
    name: string
}


export default class embedPreFormatted extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'embed',
            group: 'server',
            memberName: 'embed',
            description: 'Send a pre-formatted embed message to the channel',
            examples: ['+embed'],
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_CHANNELS'],
            args: [
                {
                    key: 'name',
                    prompt: 'Enter the embedded message name to display. Send one argument at a time. The available options are:\n' +
                        '```\n' +
                        `${Array.from(embedGuilds[0].embed.keys()).join('\n')}` +
                        '```',
                    type: 'string',
                },
            ],
        });
    }


    async run(message: CommandoMessage, { name }: promptArgs): Promise<null> {
        // attempt to send the embed if the input is a valid name type
        if (embedGuilds[0].embed.has(name)) {
            const reactMessage = embedGuilds[0].embed.get(name);
            message.say(reactMessage?.embed)
                .then(msg => {
                    if (reactMessage?.reactions) {
                        reactMessage?.reactions.forEach(reaction => {
                            msg.react(message.client.emojis.cache.get(reaction.id) as EmojiIdentifierResolvable);
                        });
                    }
                });
        }
        else {
            message.say(`${name} is not a valid embed message name.`)
                .then(invalidMsg => invalidMsg.delete({ timeout: 5000 }));
        }

        message.delete({ timeout: 5000 });


        return null;
    }
}