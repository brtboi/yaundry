import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatePostModal, type NewPostData } from '@/components/create-post-modal';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const preferredResco = 'Jonathan Edwards';

type Post = {
  id: string;
  name: string;
  location: string;
  timeAgo: string;
  avatar: number;
  image?: number;
  description: string;
  spotDescription?: string;
  isSensitive?: boolean;
  likes: number;
  liked: boolean;
  claimable: boolean;
  claimed: boolean;
  commentCount?: number;
};

const initialPosts: Post[] = [
  {
    id: '1',
    name: 'Strawberry',
    location: 'JE Laundry',
    timeAgo: '3 min ago',
    avatar: require('@/assets/images/illustrations/avatar-strawberry.png'),
    image: require('@/assets/images/illustrations/post-sock.png'),
    description: 'Sock found under JE laundry sink!!',
    spotDescription: 'Under the sink',
    likes: 21,
    liked: false,
    claimable: true,
    claimed: false,
  },
  {
    id: '2',
    name: 'Daniel',
    location: 'Saybrook Laundry',
    timeAgo: '2 hrs ago',
    avatar: require('@/assets/images/illustrations/avatar-daniel.png'),
    description:
      "Hello! If anyone can keep an eye out for a pink fuzzy sock with strawberries on it, please do so :')",
    likes: 6,
    liked: false,
    claimable: true,
    claimed: false,
  },
  {
    id: '3',
    name: 'Oscar',
    location: 'Benjamin Franklin Laundry',
    timeAgo: '1 day ago',
    avatar: require('@/assets/images/illustrations/avatar-oscar.png'),
    image: require('@/assets/images/illustrations/post-generic.png'),
    description: 'Another post',
    likes: 58,
    liked: false,
    claimable: false,
    claimed: false,
    commentCount: 5,
  },
];

export default function LostAndFoundScreen() {
  const theme = useTheme();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [createVisible, setCreateVisible] = useState(false);

  function toggleLike(id: string) {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
          : post,
      ),
    );
  }

  function claimPost(post: Post) {
    if (post.claimed) return;
    setPosts((current) => current.map((p) => (p.id === post.id ? { ...p, claimed: true } : p)));
    Alert.alert('Claimed!', `Reach out to ${post.name} to arrange pickup.`);
  }

  function toggleReveal(id: string) {
    setRevealedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreatePost(data: NewPostData) {
    const newPost: Post = {
      id: `local-${Date.now()}`,
      name: 'You',
      location: `${data.resco} Laundry`,
      timeAgo: 'Just now',
      avatar: require('@/assets/images/illustrations/avatar-blueberry.png'),
      image: data.hasPhoto ? require('@/assets/images/illustrations/post-generic.png') : undefined,
      description: data.description,
      spotDescription: data.spotDescription,
      isSensitive: data.isSensitive,
      likes: 0,
      liked: false,
      claimable: true,
      claimed: false,
    };
    setPosts((current) => [newPost, ...current]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <ThemedText style={styles.headerTitle}>Lost & Found</ThemedText>
          <Pressable
            onPress={() => setCreateVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Create a new post"
            style={[styles.newPostButton, { backgroundColor: theme.text }]}>
            <ThemedText style={[styles.newPostButtonLabel, { color: theme.background }]}>
              +
            </ThemedText>
          </Pressable>
        </View>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isBlurred = !!item.isSensitive && !revealedIds.has(item.id);
            return (
              <View style={styles.post}>
                <Image source={item.avatar} style={styles.avatar} contentFit="cover" />
                <View style={styles.postContent}>
                  <View style={styles.postHeader}>
                    <ThemedText style={styles.postMeta} numberOfLines={1}>
                      <ThemedText style={styles.postName}>{item.name} </ThemedText>
                      in {item.location}
                    </ThemedText>
                    <Pressable hitSlop={8}>
                      <Icon name="more" size={26} color={theme.text} />
                    </Pressable>
                  </View>
                  <ThemedText type="small" themeColor="textMuted">
                    {item.timeAgo}
                  </ThemedText>

                  {item.image && (
                    <Pressable
                      disabled={!item.isSensitive}
                      onPress={() => toggleReveal(item.id)}
                      style={styles.imageWrap}>
                      <Image
                        source={item.image}
                        style={[styles.postImage, isBlurred && styles.postImageBlurred]}
                        contentFit="cover"
                        blurRadius={isBlurred ? 30 : 0}
                      />
                      {isBlurred && (
                        <View style={styles.sensitiveOverlay}>
                          <ThemedText style={styles.sensitiveOverlayText}>
                            Contains delicates / intimates{'\n'}Tap to view
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  )}

                  <ThemedText style={styles.description}>{item.description}</ThemedText>
                  {item.spotDescription && (
                    <View style={styles.spotRow}>
                      <Icon name="map-pin" size={16} color={theme.textMuted} />
                      <ThemedText type="small" themeColor="textMuted">
                        {item.spotDescription}
                      </ThemedText>
                    </View>
                  )}

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => toggleLike(item.id)}
                      hitSlop={8}
                      style={styles.actionItem}>
                      <Icon
                        name={item.liked ? 'heart-filled' : 'heart'}
                        size={22}
                        color={item.liked ? '#E0245E' : theme.text}
                      />
                      <ThemedText
                        style={[styles.actionLabel, item.liked && { color: '#E0245E' }]}>
                        {item.likes} likes
                      </ThemedText>
                    </Pressable>

                    {item.claimable ? (
                      <Pressable
                        onPress={() => claimPost(item)}
                        disabled={item.claimed}
                        style={[
                          styles.claimButton,
                          {
                            backgroundColor: item.claimed
                              ? theme.backgroundElement
                              : theme.available,
                          },
                        ]}>
                        <ThemedText
                          style={[
                            styles.actionLabel,
                            { color: item.claimed ? theme.textMuted : theme.availableText },
                          ]}>
                          {item.claimed ? 'Claimed' : 'Claim'}
                        </ThemedText>
                      </Pressable>
                    ) : (
                      <View style={styles.actionItem}>
                        <Icon name="comments" size={22} color={theme.text} />
                        <ThemedText style={styles.actionLabel}>
                          {item.commentCount ?? 0} comments
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>

      <CreatePostModal
        visible={createVisible}
        defaultResco={preferredResco}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreatePost}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    paddingTop: Spacing.two + WebTopTabBarInset,
  },
  headerSpacer: {
    width: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.34,
  },
  newPostButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPostButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.five,
  },
  post: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  postContent: {
    flex: 1,
    gap: Spacing.two,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  postMeta: {
    flex: 1,
    fontSize: 14,
  },
  postName: {
    fontWeight: '600',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postImageBlurred: {
    opacity: 0.9,
  },
  sensitiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  sensitiveOverlayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  claimButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
