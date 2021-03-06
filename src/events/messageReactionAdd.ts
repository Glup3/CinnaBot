// messageReactionAdd.ts
import { Guild, GuildMember, MessageReaction, Role, TextChannel, User } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import { reactEmotes, reactMessages } from '../info/server/reactionroles';


export default async (client: CommandoClient, reaction: MessageReaction): Promise<void> => {
    // ignore reactions from itself
    if (reaction.me) return;

    const message = reaction.message;

    // reaction role add/remove
    // if a valid emote is used on a valid message, get the role it corresponds to
    if (reactMessages.some(reactMessage => reactMessage.id === message.id)) {
        const roleID = getRoleID();
        if (roleID !== '') {
            // give or remove the role from the user
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
            reactEmotes.forEach(emote => {
                if (reaction.emoji.id !== emote.id) {
                    const guildChannel = client.channels.cache.get(emote.message!.channel!.id) as TextChannel;
                    guildChannel.messages.fetch(emote.message!.id)
                        .then(guildMessage => guildMessage.reactions.cache.get(reaction.emoji.id!)!.remove());
                }
            });
        }


    }


    function getRoleID(): string {
        // check if the message ID matches any valid message ID for reaction roles
        // if the emote name is matched, return the role id
        // else return an empty string
        const emote = reactEmotes.filter(reactEmote => (reaction.emoji.id === reactEmote.id) ? true : false)[0];
        if (emote) {
            return emote.roleID!;
        }
        else {
            return '';
        }
    }
};