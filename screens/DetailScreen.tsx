import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import React from 'react';
import {
    Dimensions,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PremiumHeader from '../components/PremiumHeader';
import { getImageUrl } from '../lib/supabase';
import { Category, Place } from '../types/place';

type RootStackParamList = {
    Home: undefined;
    Detail: { place: Place };
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

type Props = {
    route: DetailScreenRouteProp;
    navigation: any;
};

const { width } = Dimensions.get('window');

const CATEGORY_COLORS: Record<Category, string> = {
    tourism: '#2E8B57',
    restaurant: '#FF7F50',
    cafe: '#A0522D',
    temple: '#FFD700',
    festival: '#FF4500',
};

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { place } = route.params;
    const insets = useSafeAreaInsets();
    const themeColor = CATEGORY_COLORS[place.category as Category] || '#2E8B57';

    const openGoogleMaps = () => {
        const lat = place.latitude;
        const lng = place.longitude;
        const label = place.name;

        // Universal Google Maps URL (Works on browser and targets app if installed)
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${place.id}`;

        // Platform specific schemes for direct app targeting
        const appleMapsUrl = `maps:0,0?q=${lat},${lng}(${label})`;
        const googleMapsAppUrl = Platform.OS === 'ios'
            ? `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`
            : `google.navigation:q=${lat},${lng}`;

        Linking.canOpenURL(googleMapsAppUrl).then(supported => {
            if (supported) {
                Linking.openURL(googleMapsAppUrl);
            } else {
                // Fallback to web (which often triggers app anyway)
                Linking.openURL(url);
            }
        });
    };

    const makeCall = () => {
        if (place.phone) {
            Linking.openURL(`tel:${place.phone}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Fixed Header Overlay */}
            <PremiumHeader title={place.name} onBack={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Immersive Hero */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: getImageUrl(place.image_path) || undefined }} style={styles.heroImage} />
                    <View style={styles.heroOverlay} />
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {/* Header Bento */}
                    <View style={styles.card}>
                        <View style={styles.titleRow}>
                            <Text style={styles.name}>{place.name}</Text>
                            <View style={[styles.badge, { backgroundColor: themeColor + '20' }]}>
                                <Text style={[styles.badgeText, { color: themeColor }]}>
                                    {place.category === 'tourism' ? 'ที่เที่ยว' :
                                        place.category === 'restaurant' ? 'ร้านอาหาร' :
                                            place.category === 'cafe' ? 'คาเฟ่' :
                                                place.category === 'temple' ? 'วัด' : 'เทศกาล'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={[styles.iconBox, { backgroundColor: themeColor + '10' }]}>
                                <Ionicons name="location" size={18} color={themeColor} />
                            </View>
                            <Text style={styles.addressText}>{place.address}</Text>
                        </View>
                    </View>

                    {/* Description Bento */}
                    {place.description && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>รายละเอียด / About</Text>
                            <Text style={styles.descriptionText}>{place.description}</Text>
                        </View>
                    )}

                    {/* Contact & Date Bento */}
                    {(place.phone || place.date) && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>ข้อมูลติดต่อ / เวลา</Text>
                            {place.phone && (
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconBox, { backgroundColor: '#4682B410' }]}>
                                        <Ionicons name="call" size={18} color="#4682B4" />
                                    </View>
                                    <Text style={styles.infoText}>{place.phone}</Text>
                                </View>
                            )}
                            {place.date && (
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconBox, { backgroundColor: '#FF634710' }]}>
                                        <Ionicons name="calendar" size={18} color="#FF6347" />
                                    </View>
                                    <Text style={styles.infoText}>{place.date}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Map Bento */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>ตำแหน่งบนแผนที่</Text>
                        <View style={styles.mapBorder}>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.miniMap}
                                initialRegion={{
                                    latitude: place.latitude,
                                    longitude: place.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker coordinate={{ latitude: place.latitude, longitude: place.longitude }}>
                                    <View style={[styles.miniMarker, { backgroundColor: themeColor }]} />
                                </Marker>
                            </MapView>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Action Bar */}
            <View style={[styles.actionBar, { paddingBottom: insets.bottom + 15 }]}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeColor }]} onPress={openGoogleMaps}>
                    <Ionicons name="navigate" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>นำทางด้วย Google Maps</Text>
                </TouchableOpacity>

                {place.phone && (
                    <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={makeCall}>
                        <Ionicons name="call" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    heroContainer: {
        width: '100%',
        height: 350,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    content: {
        padding: 20,
        marginTop: -30,
        backgroundColor: '#F8F9FB',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: '900',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        lineHeight: 20,
    },
    infoText: {
        fontSize: 15,
        color: '#444',
        fontWeight: '600',
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
        marginBottom: 15,
    },
    mapBorder: {
        height: 180,
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    miniMap: {
        flex: 1,
    },
    miniMarker: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#fff',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 20,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        height: 55,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginLeft: 10,
    },
    callButton: {
        width: 60,
        backgroundColor: '#4682B4',
        flex: 0,
    },
});

export default DetailScreen;
