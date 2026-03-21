import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { statusLabel } from "../utils/helpers";

const statusColor = {
  SENT: colors.info,
  RECEIVED: colors.success,
  IN_TRANSIT: colors.primary,
  WAITING_RECEIPT: colors.warning,
  PENDING: colors.warning,
  OVERDUE: colors.danger
};

export const StatusPill = ({ status }) => {
  const color = statusColor[status] || colors.info;

  return (
    <View style={[styles.pill, { borderColor: `${color}88`, backgroundColor: `${color}22` }]}>
      <Text style={[styles.text, { color }]}>{statusLabel(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  text: {
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5
  }
});
