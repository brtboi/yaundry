import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing, WebTopTabBarInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Post = {
  id: string;
  name: string;
  location: string;
  timeAgo: string;
  avatar: number;
  image?: number;
  description: string;
  likes: number;
  actionLabel: string;
};

const posts: Post[] = [
  {
    id: '1',
    name: 'Strawberry',
    location: 'JE Laundry',
    timeAgo: '3 min ago',
    avatar: require('@/assets/images/illustrations/avatar-strawberry.png'),
    image: require('@/assets/images/illustrations/post-sock.png'),
    description: 'Sock found under JE laundry sink!!',
    likes: 21,
    actionLabel: 'Claim',
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
    actionLabel: 'Claim',
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
    actionLabel: '5 comments',
  },
];

export default function LostAndFoundScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Lost & Found</ThemedText>
        </View>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.post}>
              <Image source={item.avatar} style={styles.avatar} contentFit="cover" />
              <View style={styles.postContent}>
                <View style={styles.postHeader}>
                  <ThemedText style={styles.postMeta} numberOfLines={1}>
                    <ThemedText style={styles.postName}>{item.name} </ThemedText>
                    in {item.location}
                  </ThemedText>
                  <Pressable hitSlop={8}>
                    <Icon name="more" size={24} color={theme.text} />
                  </Pressable>
                </View>
                <ThemedText type="small" themeColor="textMuted">
                  {item.timeAgo}
                </ThemedText>
                {item.image && (
                  <Image source={item.image} style={styles.postImage} contentFit="cover" />
                )}
                <ThemedText style={styles.description}>{item.description}</ThemedText>
                <View style={styles.actions}>
                  <View style={styles.actionItem}>
                    <Icon name="heart" size={20} color={theme.text} />
                    <ThemedText style={styles.actionLabel}>{item.likes} likes</ThemedText>
                  </View>
                  <View style={styles.actionItem}>
                    <Icon name="comments" size={20} color={theme.text} />
                    <ThemedText style={styles.actionLabel}>{item.actionLabel}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
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
    paddingVertical: Spacing.two,
    paddingTop: Spacing.two + WebTopTabBarInset,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.28,
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
  postImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 4,
  },
  description: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
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
});
