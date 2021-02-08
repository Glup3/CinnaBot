// messageReactionAdd.ts
import { Guild, GuildChannel, GuildMember, MessageReaction, Role, TextChannel, User } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { createImportSpecifier } from 'typescript';
import { reactEmotes, reactMessages } from '../info/server/reactionroles';


export default async (client: CommandoClient, reaction: MessageReaction): Promise<void> => {
    // ignore reactions from itself
    if (reaction.me) return;

    // reaction role add/remove
    // if a valid emote is used on a valid message, get the role it corresponds to
    if (reactMessages.some(reactMessage => reactMessage.id === reaction.message.id)) {
        const roleID = getRoleID();
        if (roleID !== '') {
            const role = (reaction.message.guild as Guild).roles.cache.get(roleID) as Role;
            const user = (reaction.message.guild as Guild).members.cache.get((reaction.users.cache.first() as User).id) as GuildMember;
            const hasRole = user.roles.cache.get(role.id);
            if (hasRole) {
                user.roles.remove(role).catch(console.error);
            }
            else {
                user.roles.add(role).catch(console.error);
            }

            // remove the reaction
            const otherUsers = reaction.users.cache.filter(reactUsers => reactUsers.id !== reaction.message.author.id);
            const otherReactions = reaction.message.reactions.cache.filter(reactions => !reactions.users.cache.has(reactions.message.author.id));
            try {
                for (const otherReaction of otherReactions.values()) {
                    for (const otherUser of otherUsers.values()) {
                        await otherReaction.users.remove(otherUser.id);
                    }
                }
            }
            catch (error) {
                console.error('Failed to remove reactions.');
            }
        }
        else {
            // remove invalid reactions from each message
            Promise.resolve(client.channels.cache.get(reaction.message.channel.id) as TextChannel)
                .then(channel => channel.messages.fetch(reaction.message.id)
                    .then(guildMessage => {
                        guildMessage.reactions.cache.get(reaction.emoji.id as string)?.remove()
                            .catch(error => console.log('Failed to remove reactios: ', error));
                    }));
        }
    }


    function getRoleID(): string {
        // check if the message ID matches any valid message ID for reaction roles
        // if the emote name is matched, return the role id
        // else return an empty string
        const emote = reactEmotes.filter(emote => (reaction.emoji.id === emote.id) ? true : false)[0];

        if (emote) {
            return emote.roleID!;
        }
        else {
            return '';
        }
    }
};